import express from "express";
import { validate } from "../middleware/validate.schema";
import { createProposalSchema } from "../validations/proposal.validation";
import { createProposal, getProposalStatus, getProposalData } from "../controller/proposal.controller";
import { authenticate } from "../middleware/authenticate";
import { generalLimiter, proposalLimiter } from "../middleware/rate-limit";

const proposalRouter = express.Router();

// TODO: add authenticate middleware to GET endpoints

proposalRouter.post('/start', proposalLimiter, authenticate, validate(createProposalSchema), createProposal);
proposalRouter.get('/:id/status', generalLimiter, getProposalStatus);
proposalRouter.get('/:id', generalLimiter, getProposalData);

export { proposalRouter }