import { Queue } from "bullmq";
import { REDIS_HOST, REDIS_PORT } from "../../lib/env.variables";

export const proposalGenerationQueue = new Queue('proposal-processing', {
    connection: {
        host: REDIS_HOST || 'localhost',
        port: typeof REDIS_PORT === 'string' ? parseInt(REDIS_PORT) : REDIS_PORT
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