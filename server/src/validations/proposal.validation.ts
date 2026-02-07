import Joi from "joi";

const createProposalSchema = Joi.object({
    scopeId: Joi.string().required(),
    userId: Joi.string().required()
})

export { createProposalSchema } 