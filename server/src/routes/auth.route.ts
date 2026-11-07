import express from "express"
import { validate } from "../middleware/validate.schema.js";
import { loginUserSchema, registerUserSchema } from "../validations/auth.validation.js";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controller/auth.controller.js";
import { authLimiter } from "../middleware/rate-limit.js";

const authRouter = express.Router();

authRouter.post('/register', authLimiter, validate(registerUserSchema), registerUser);
authRouter.post('/login', authLimiter, validate(loginUserSchema), loginUser);
authRouter.post('/logout', authLimiter, logoutUser);
authRouter.post('/refresh', authLimiter, refreshAccessToken); 

export { authRouter }