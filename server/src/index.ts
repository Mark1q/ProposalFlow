import express from 'express'
import cors from 'cors'
import { scopeRouter } from './routes/scope.route';
import { proposalRouter } from './routes/proposal.route';
import { errorHandling } from './middleware/error.middleware';
import { config } from './config/env.variables';
import { serverAdapter } from './routes/bullboard.route';
import { authRouter } from './routes/auth.route';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma';
import { redisClient } from './lib/redis';

if (!config.dbUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({status: `Connected to port ${config.port}`});
})

app.get('/health', async (req, res) => {
  try {
    // lightweight check to ensure the DB is reachable
    await prisma.$queryRaw`SELECT 1`; 
    return res.status(200).json({ status: 'up' });
  } catch (error) {
    return res.status(503).json({ status: 'db-down' });
  }
});

app.use('/api/scope', scopeRouter);
app.use('/api/proposal', proposalRouter);
app.use('/admin/queues', serverAdapter.getRouter());
app.use('/api/auth', authRouter);

app.use(errorHandling);

app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
})


