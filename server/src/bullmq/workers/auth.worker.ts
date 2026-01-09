import { Job, Worker } from "bullmq";
import { config } from "../../config/env.variables";

const registrationWorker = new Worker('user-registration-processing', async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log("Job data:", job.data);

    
}, {
    connection: {
        host: config.redis.host,
        port: parseInt(String(config.redis.port) || '6379', 10)
    }
})

registrationWorker.on('completed', (job: Job) => { console.log(`Job ${job.id} completed`)});