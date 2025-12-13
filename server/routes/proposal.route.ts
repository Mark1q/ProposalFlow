import express from "express";
import { validate } from "../middleware/validate.schema";
import { createProposalSchema } from "../validations/proposal.validation";
import { createProposal, getProposalStatus } from "../controller/proposal.controller";

const proposalRouter = express.Router();

proposalRouter.post('/start', validate(createProposalSchema), createProposal);
proposalRouter.get('/:id/status', getProposalStatus);
// proposalRouter.get('/:id', );

export { proposalRouter }