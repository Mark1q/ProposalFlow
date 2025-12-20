import express from "express";
import { validate } from "../middleware/validate.schema";
import { createProposalSchema } from "../validations/proposal.validation";
import { createProposal, getProposalStatus, getProposalData } from "../controller/proposal.controller";

const proposalRouter = express.Router();

proposalRouter.post('/start', validate(createProposalSchema), createProposal);
proposalRouter.get('/:id/status', getProposalStatus);
proposalRouter.get('/:id', getProposalData);

export { proposalRouter }