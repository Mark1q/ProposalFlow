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

const verifyToken = async (token: string, secretType: 'access' | 'refresh') => {
    const secret = secretType === 'access' ? ACCESS_SECRET : REFRESH_SECRET;

    try {
        const { payload } = await jose.jwtVerify(token, secret);

        return payload;
    } catch (error) {
        return null;
    }
}

export { signAccessToken, signRefreshToken, verifyToken }