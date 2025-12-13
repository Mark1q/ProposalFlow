import { delay, Job, Worker } from "bullmq";
import { REDIS_HOST, REDIS_PORT } from "../../lib/env.variables";
import { prisma } from "../../lib/prisma";
import { generateProposalDetails } from "../../controller/api.controller";

const proposalGenerationWorker = new Worker('proposal-processing', async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log("Job data:", job.data);

    const { proposalId } = job.data;

    const proposal = await prisma.proposal.update({
        data: {
            status: "processing"
        },
        where: {
            id: proposalId
        },
        include: {
            scope: true
        }
    });

    const result = await generateProposalDetails(proposal.scope.scopeJson);

    console.log(result.finalMarkdown);

    await prisma.proposal.update({
        data: {
            status: "completed",
            finalMarkdown: result.finalMarkdown,
        },
        where: {
            id: proposalId
        }
    });
    
}, {
    connection: {
      host: REDIS_HOST,
      port: typeof REDIS_PORT === 'string' ? parseInt(REDIS_PORT) : REDIS_PORT
    }
})

proposalGenerationWorker.on('completed', (job) => console.log(`Job ${job.id} completed!`));
proposalGenerationWorker.on('failed', async (job, err) => {
    if (!job) return;

    const maxAttempts = job.opts.attempts || 1; 

    if (job.attemptsMade >= maxAttempts) {
        console.error(`Job ${job.id} failed permanently after ${job.attemptsMade} attempts: ${err.message}`);

        await prisma.proposal.update({
            where: { id: job.data.proposalId },
            data: { 
                status: "failed" 
            }
        });
    } else {
        console.warn(`Job ${job.id} failed attempt ${job.attemptsMade}/${maxAttempts}. Retrying...`);
    }
});