import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../lib/auth.tokens";
import { CustomJWTPayload } from "../interfaces/auth.interface";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
        return next(new AppError("You are not logged in. Please log in to get access.", 401));
    }

    try {
        const jwtPayload = await verifyToken(token);

        if(!jwtPayload) { return next(new AppError("Invalid token", 401)); }

        req.user = jwtPayload as CustomJWTPayload;
        next();
    } catch (error) {
        return next(new AppError("Internal server error", 500));
    }
}