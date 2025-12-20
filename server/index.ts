import express from 'express'
import cors from 'cors'
import { scopeRouter } from './routes/scope.route';
import { proposalRouter } from './routes/proposal.route';
import { errorHandling } from './middleware/error.middleware';
import { CONNECTION_URL, PORT} from './lib/env.variables';
import { serverAdapter } from './routes/bullboard.route';


if (!CONNECTION_URL) {
    throw new Error("DATABASE_URL environment variable is missing.");
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({status: `Connected to port ${PORT}`});
})

app.use('/api/scope', scopeRouter);
app.use('/api/proposal', proposalRouter);
app.use('/admin/queues', serverAdapter.getRouter());

app.use(errorHandling);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})


