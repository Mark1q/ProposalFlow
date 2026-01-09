import express from "express"
import { validate } from "../middleware/validate.schema";
import { loginUserSchema, registerUserSchema } from "../validations/auth.validation";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controller/auth.controller";

const authRouter = express.Router();

authRouter.post('/register', validate(registerUserSchema), registerUser);
authRouter.post('/login', validate(loginUserSchema), loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/refresh', refreshAccessToken);

export { authRouter }