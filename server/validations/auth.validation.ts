import Joi from "joi";

const registerUserSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(8).max(30),
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional()
});

const loginUserSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    accessToken: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required()
});

export { registerUserSchema, loginUserSchema }