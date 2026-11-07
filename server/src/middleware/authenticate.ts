import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../lib/auth.tokens.js";

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
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Token has expired. Please log in again.", 401));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new AppError("Invalid token signature.", 401));
        }
        
        return next(error);
    }
}

export { authenticate }