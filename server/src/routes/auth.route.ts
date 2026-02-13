import express from "express"
import { validate } from "../middleware/validate.schema";
import { loginUserSchema, registerUserSchema } from "../validations/auth.validation";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controller/auth.controller";
import { authLimiter } from "../middleware/rate-limit";

const authRouter = express.Router();

authRouter.post('/register', authLimiter, validate(registerUserSchema), registerUser);
authRouter.post('/login', authLimiter, validate(loginUserSchema), loginUser);
authRouter.post('/logout', authLimiter, logoutUser);
authRouter.post('/refresh', authLimiter, refreshAccessToken); 

export { authRouter }