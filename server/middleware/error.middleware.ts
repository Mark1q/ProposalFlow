import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

const errorHandling = (err: unknown, req: Request, res: Response, next: NextFunction) => {

    // Handle Invalid JSON
    if (err instanceof SyntaxError && 'body' in err) {
        console.error(err);
        return res.status(400).send({ status: 400, message: err.message }); // Bad request
    }

    if (err instanceof AppError) {
        return res.status(err.status).send({ status: err.status, message: err.message });
    }

    console.error("Unhandled error:", err);
    
    return res.status(500).json({error: "Internal server error"});
}

export { errorHandling }