import dotenv from 'dotenv'
dotenv.config()

const CONNECTION_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

export { CONNECTION_URL, PORT, REDIS_PORT, REDIS_HOST, PYTHON_SERVICE_URL }