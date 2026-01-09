import { Queue } from "bullmq";
import { config } from "../../config/env.variables";

export const proposalGenerationQueue = new Queue('proposal-processing', {
    connection: {
        host: config.redis.host || 'localhost',
        port: parseInt(String(config.redis.port) || '6379', 10)
    },
    defaultJobOptions: {
        attempts: 10,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});