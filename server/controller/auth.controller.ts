import { NextFunction, Request, Response } from "express"
import { LoginInput, RegisterInput } from "../interfaces/auth.interface"
import { prisma } from "../lib/prisma"
import { registerUserQueue } from "../bullmq/queues/auth.queue";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";
import * as bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/auth.tokens";
import { DUMMY_HASH } from "../constants";
import { CustomJWTPayload } from '../interfaces/auth.interface'

declare global {
  namespace Express {
    interface Request {
      user?: CustomJWTPayload;
    }
  }
}

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

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            httpOnly: true,
            sameSite: 'strict',
            path: '/auth/refresh'
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            sameSite: 'strict'
        });

        registerUserQueue.add("welcome-flow", { email: email, userId: user.id });

        return res.status(201).json({
            message: "Logged in succesfully",
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

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            httpOnly: true,
            sameSite: 'strict',
            path: '/auth/refresh'
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            sameSite: 'strict'
        });

        return res.status(200).json({
            message: "Logged in succesfully",
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
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: 'strict',
    });

    
    res.clearCookie("refreshToken", {
        path: '/auth/refresh', 
        httpOnly: true,
        sameSite: 'strict',
    });

    return res.status(200).json({ 
        status: "success", 
        message: "Logged out successfully" 
    });
}

export { registerUser, loginUser, logoutUser }