import express from "express";
import { validate } from "../middleware/validate.schema.js";
import { createProposalSchema } from "../validations/proposal.validation.js";
import { createProposal, getProposalStatus, getProposalData } from "../controller/proposal.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { generalLimiter, proposalLimiter } from "../middleware/rate-limit.js";

const proposalRouter = express.Router();


proposalRouter.post('/start', proposalLimiter, authenticate, validate(createProposalSchema), createProposal);
proposalRouter.get('/:id/status', generalLimiter, authenticate, getProposalStatus);
proposalRouter.get('/:id', generalLimiter, authenticate, getProposalData);

export { proposalRouter }