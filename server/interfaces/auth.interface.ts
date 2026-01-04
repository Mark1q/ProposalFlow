import { JWTPayload } from "jose";

type Roles = 'admin' | 'user' | 'guest';

interface RegisterInput {
    email: string
    password: string
    firstName?: string,
    lastName?: string
}

interface LoginInput {
    email: string,
    password: string,
}

interface CustomJWTPayload extends JWTPayload {
    id: string;
    email: string;
}

export { Roles, RegisterInput, LoginInput, CustomJWTPayload }