import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { proposalGenerationQueue } from '../bullmq/queues/proposal.queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(proposalGenerationQueue)],
  serverAdapter: serverAdapter,
});

export { serverAdapter }