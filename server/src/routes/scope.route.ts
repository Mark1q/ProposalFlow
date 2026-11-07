import express from 'express'
import { createScope, getScopeById } from '../controller/scope.controller.js';
import { validate } from '../middleware/validate.schema.js';
import { createScopeSchema } from '../validations/scope.validation.js';
import { authenticate } from '../middleware/authenticate.js';
import { generalLimiter, scopeLimiter } from '../middleware/rate-limit.js';

const scopeRouter = express.Router()

/**
 * Create a new Scope.
 *
 * @route POST /scope
 * @summary POST the Scope Wizard information as JSON
 * @param {ScopeWizardInput} req.body - Input JSON from Scope Wizard
 * @returns {object} 201 - Created scope
 * @returns {number} 201.scope_id - ID of the created scope
 */
scopeRouter.post('/', scopeLimiter, authenticate , validate(createScopeSchema) , createScope);
scopeRouter.get('/:id', generalLimiter, authenticate, getScopeById); // TODO: add authenticate middleware

export { scopeRouter }