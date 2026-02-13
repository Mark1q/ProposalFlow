import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../lib/redis';
import { config } from '../config/env.variables';

const createRateLimiter = (windowMs: number, max: number, prefix: string = 'rl') => {
    return rateLimit({
        windowMs: config.node_env === 'test' ? 1000 : windowMs,
        max: config.node_env === 'test' ? 1000 : max,
        standardHeaders: true, 
        legacyHeaders: false,
        
        store: new RedisStore({
            // @ts-expect-error - ioredis and rate-limit-redis types sometimes clash
            sendCommand: (...args: string[]) => redisClient.call(...args),
            prefix: `${prefix}:`,
        }),
        
        handler: (req, res) => {
            res.status(429).json({
                status: 429,
                message: 'Too many requests, please try again later.'
            });
        }
    });
};

/**
 * Auth Limiter
 * - 15 minute window
 * - 5 login attempts max (prevents brute force)
 */
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'rl:auth');

/**
 * Proposal Limiter
 * - 1 hour window (API calls are expensive)
 * - 10 requests max
 */
export const proposalLimiter = createRateLimiter(60 * 60 * 1000, 10, 'rl:proposal');

/**
 * Scope Limiter
 * - 15 minute window
 * - 20 requests max (lightweight operation, user might iterate on input)
 */
export const scopeLimiter = createRateLimiter(15 * 60 * 1000, 20, 'rl:scope');

/**
 * General Limiter
 * - 15 minute window
 * - 100 requests max (prevents abuse)
 */
export const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'rl:general');
