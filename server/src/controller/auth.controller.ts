import { NextFunction, Request, Response } from "express"
import { createHash } from "crypto"
import { LoginInput, RefreshGenerateToken, RegisterInput } from "../interfaces/auth.interface.js"
import { prisma } from "../lib/prisma.js"
import { registerUserQueue } from "../bullmq/queues/auth.queue.js";
import { AppError } from "../utils/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import * as bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/auth.tokens.js";
import { DUMMY_HASH } from "../constants.js";
import { config } from "../config/env.variables.js"

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

const hashToken = (token: string): string => {
    return createHash("sha256").update(token).digest("hex");
};

const registerUser = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
    const { firstName, lastName, password, email } = req.body;

    try {
        const hashedPassword: string = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            }
        });

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt
            }
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            httpOnly: true,
            sameSite: 'strict',
            secure: config.node_env === 'production',
            path: '/api/auth/refresh'
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            secure: config.node_env === 'production',
            sameSite: 'strict'
        });

        registerUserQueue.add("welcome-flow", { email: email, userId: user.id, name: user.firstName + " " + user.lastName });

        return res.status(201).json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                firstName: user.firstName
            }
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return next(new AppError("User with this email already exists", 400));
        }

        return next(new AppError(error instanceof Error ? error.message : "Internal server error", 500));
    }
};

const loginUser = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        const hashToCompare = user ? user.password : DUMMY_HASH
        const isMatch = await bcrypt.compare(password, hashToCompare);

        if (!user || !isMatch) { return next(new AppError("Invalid email or password", 401)); }


        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt
            }
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            httpOnly: true,
            secure: config.node_env === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh'
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            secure: config.node_env === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                firstName: user.firstName
            }
        });

    } catch (error) {
        return next(new AppError("Internal server error", 500));
    }
}

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (token) {
        try {
            const tokenHash = hashToken(token);
            await prisma.refreshToken.deleteMany({
                where: { tokenHash }
            });
        } catch (error) {
            // Ignore DB errors on logout
        }
    }

    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: 'strict',
        secure: config.node_env === 'production'
    });

    res.clearCookie("refreshToken", {
        path: '/api/auth/refresh',
        httpOnly: true,
        secure: config.node_env === 'production',
        sameSite: 'strict',
    });

    return res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
}

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return next(new AppError("Refresh token not found", 401));
    }

    try {
        const jwtPayload = await verifyToken(token, 'refresh');

        if (!jwtPayload || !jwtPayload.sub) {
            res.clearCookie("accessToken", { httpOnly: true, sameSite: 'strict' });
            res.clearCookie("refreshToken", { path: '/api/auth/refresh', httpOnly: true, sameSite: 'strict' });
            return next(new AppError("Invalid or expired refresh token", 401));
        }

        const userId = jwtPayload.sub as string;
        const incomingTokenHash = hashToken(token);

        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { tokenHash: incomingTokenHash }
        });

        if (!tokenRecord) {
            await prisma.refreshToken.deleteMany({
                where: { userId }
            });

            res.clearCookie("accessToken", { httpOnly: true, sameSite: 'strict' });
            res.clearCookie("refreshToken", { path: '/api/auth/refresh', httpOnly: true, sameSite: 'strict' });

            return next(new AppError("Invalid or reused refresh token", 401));
        }

        const accessToken = await signAccessToken(userId);
        const newRefreshToken = await signRefreshToken(userId);
        const newTokenHash = hashToken(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        try {
            await prisma.$transaction([
                prisma.refreshToken.delete({ where: { id: tokenRecord.id } }),
                prisma.refreshToken.create({
                    data: {
                        tokenHash: newTokenHash,
                        userId,
                        expiresAt: newExpiresAt
                    }
                })
            ]);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                return next(new AppError("Token already used, please retry", 401));
            }
            throw error;
        }

        res.cookie('refreshToken', newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            httpOnly: true,
            sameSite: 'strict',
            secure: config.node_env === 'production',
            path: '/api/auth/refresh'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            secure: config.node_env === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            status: "success",
            message: "Access token refreshed"
        });

    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError('Internal server error', 500));
    }
}

export { registerUser, loginUser, logoutUser, refreshAccessToken }