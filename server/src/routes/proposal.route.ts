import express from "express";
import { validate } from "../middleware/validate.schema";
import { createProposalSchema } from "../validations/proposal.validation";
import { createProposal, getProposalStatus, getProposalData } from "../controller/proposal.controller";
import { authenticate } from "../middleware/authenticate";

const proposalRouter = express.Router();

// TODO: add authenticate middleware to GET endpoints

proposalRouter.post('/start', authenticate, validate(createProposalSchema), createProposal);
proposalRouter.get('/:id/status', getProposalStatus);
proposalRouter.get('/:id', getProposalData);

export { proposalRouter }