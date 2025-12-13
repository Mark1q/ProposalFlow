import Joi from "joi";
import { ScopeInput } from "../interfaces/scope.interface";

const createScopeSchema: Joi.ObjectSchema<ScopeInput> = Joi.object({
  projectName: Joi.string().required(),
  businessGoal: Joi.string().required(),
  features: Joi.array().items(Joi.string()).min(1).required(),
  techStack: Joi.array().items(Joi.string()).min(1).required(),
  budget: Joi.number().positive().required(),
  timeline: Joi.string().required(),
});

export { createScopeSchema }