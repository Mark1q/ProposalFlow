import Joi from "joi";

const registerUserSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(8).max(30),
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional()
});

export { registerUserSchema }