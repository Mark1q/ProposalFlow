import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { scopeRouter } from './routes/scope.route.js';
import { proposalRouter } from './routes/proposal.route.js';
import { errorHandling } from './middleware/error.middleware.js';
import { config } from './config/env.variables.js';
import { serverAdapter } from './routes/bullboard.route.js';
import { authRouter } from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';
import { authorize } from './middleware/authorize.js';
import { authenticate } from './middleware/authenticate.js';

if (!config.dbUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(helmet());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ status: `Connected to port ${config.port}` });
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
app.use('/admin/queues', authenticate, authorize('ADMIN'), serverAdapter.getRouter());
app.use('/api/auth', authRouter);

app.use(errorHandling);

app.listen(config.port, () => {
  console.log(`Listening to port ${config.port}`);
})


