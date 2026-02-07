import { Job, Worker } from "bullmq";
import { Resend } from "resend";
import { config } from "../../config/env.variables";
import { prisma } from "../../lib/prisma";

const registrationWorker = new Worker('welcome-flow', async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log("Job data:", job.data);

    const { email, userId, name } = job.data;
    const link = "" // dummy link for main page 

    const userExists = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    // Check to see if user exists in order to avoid sending emails if they deleted their account
    if (!userExists) return;

    const resend = new Resend(config.emailApiKey);

    // TODO: create a folder for emails with an email sender and a subfolder with templates

    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['mark.eduard7@gmail.com'], // add your own email address when testing locally
        subject: 'Thank you for choosing ProposalFlow!',
        text: `
            Hi, ${name}!

            Use the link below to sign in to ProposalFlow:

            {{MAGIC_LINK}}

            This link expires in 10 minutes and can only be used once.

            If you didn't request this email, you can safely ignore it.

            —
            ProposalFlow`
    })

    if (error) { console.error(error); }
}, {
    connection: {
        host: config.redis.host,
        port: parseInt(String(config.redis.port) || '6379', 10)
    }
})

registrationWorker.on('completed', (job: Job) => { console.log(`Job ${job.id} completed`)});
registrationWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
  
  if (job) {
    console.error(`Failed Data:`, job.data);
  }
});