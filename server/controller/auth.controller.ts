import { NextFunction, Request, Response } from "express"
import { RegisterInput } from "../interfaces/auth.interface"
import { prisma } from "../lib/prisma"
import { registerUserQueue } from "../bullmq/queues/auth.queue";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";
import * as bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../lib/auth.tokens";

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
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        })

        registerUserQueue.add("welcome-flow", { email: email, userId: user.id, password: hashedPassword });

        res.status(201).json({userId: user.id, accessToken: accessToken });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return next(new AppError("User with this email already exists", 400));
        }
        
        return next(new AppError(error instanceof Error ? error.message : "Internal server error", 500));
    }
}

export { registerUser }