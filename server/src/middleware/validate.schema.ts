import Joi from "joi"
import { ScopeInput } from "../interfaces/scope.interface"
import { NextFunction, Request, Response } from "express";

const validate = (schema: Joi.ObjectSchema<ScopeInput>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: "Incorrect data format", details: error.message });   
        }

        next()
    }
}

export { validate }