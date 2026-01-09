import { Queue } from "bullmq";
import { config } from "../../config/env.variables";

export const registerUserQueue = new Queue("user-registration-queue", {
    connection: {
        host: config.redis.host || 'localhost',
        port: parseInt(String(config.redis.port) || '6379', 10)
    },
    defaultJobOptions: {
        attempts: 10,
        backoff: {
            type: 'exponential',
            delay: 2000, 
        },
        removeOnComplete: true,
        sizeLimit: 1000
    }
});