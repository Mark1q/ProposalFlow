import express from "express"
import { validate } from "../middleware/validate.schema";
import { registerUserSchema } from "../validations/auth.validation";

const authRouter = express.Router();

authRouter.post('/register', validate(registerUserSchema), );

export { authRouter }