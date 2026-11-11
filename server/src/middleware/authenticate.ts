import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../lib/auth.tokens.js";
import { errors } from "jose";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
        return next(new AppError("You are not logged in. Please log in to get access.", 401));
    }

    try {
        const jwtPayload = await verifyToken(token, 'access');

        if(!jwtPayload || !jwtPayload.sub) { 
            return next(new AppError("Invalid token", 401)); 
        }

        req.user = { 
            id: jwtPayload.sub as string
        };
        
        next();
    } catch (error) {
    if (error instanceof errors.JWTExpired) {
        return next(new AppError("Token has expired. Please log in again.", 401));
    }
    if (error instanceof errors.JOSEError) {
        return next(new AppError("Invalid token.", 401));
    }
    return next(error);
}
}

export { authenticate }