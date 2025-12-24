import express from 'express'
import cors from 'cors'
import { scopeRouter } from './routes/scope.route';
import { proposalRouter } from './routes/proposal.route';
import { errorHandling } from './middleware/error.middleware';
import { config } from './config/env.variables';
import { serverAdapter } from './routes/bullboard.route';


if (!config.dbUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({status: `Connected to port ${config.port}`});
})

app.use('/api/scope', scopeRouter);
app.use('/api/proposal', proposalRouter);
app.use('/admin/queues', serverAdapter.getRouter());

app.use(errorHandling);

app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
})


