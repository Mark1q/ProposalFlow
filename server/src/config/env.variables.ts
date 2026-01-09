import dotenv from 'dotenv'
dotenv.config()

export const config = {
    dbUrl: process.env.DATABASE_URL!,
    port: Number(process.env.PORT) || 8080,
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
    },
    jwt: {
        accessSecret: process.env.ACCESS_TOKEN_SECRET!,
        refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
        accessExpiration: process.env.ACCESS_TOKEN_EXPIRY!,
        refreshExpiration: process.env.REFRESH_TOKEN_EXPIRY!
    },
    pythonServiceUrl: process.env.PYTHON_SERVICE_URL,
};