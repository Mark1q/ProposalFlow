import * as jose from 'jose'
import { config } from '../config/env.variables';

const ACCESS_SECRET = new TextEncoder().encode(config.jwt.accessSecret);
const REFRESH_SECRET = new TextEncoder().encode(config.jwt.refreshSecret);

const signAccessToken = async (userId: string) => {
    return new jose.SignJWT({sub: userId})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessExpiration)
    .sign(ACCESS_SECRET);
}

const signRefreshToken = async (userId: string) => {
    return new jose.SignJWT({sub: userId})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpiration)
    .sign(REFRESH_SECRET);
}

const verifyToken = async (token: string) => {
    try {
        const { payload } = await jose.jwtVerify(token, ACCESS_SECRET);

        return payload;
    } catch (error) {
        return null;
    }
}

export { signAccessToken, signRefreshToken, verifyToken }