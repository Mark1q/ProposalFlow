import { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";

const authorize = (...allowed: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return next(new AppError("Authentication required", 401));

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true }
        });

        if (!user || !allowed.includes(user.role)) {
            return next(new AppError("Forbidden", 403));
        }
        next();
    };
};