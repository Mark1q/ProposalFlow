import { config } from "../config/env.variables";
import Redis from "ioredis";

export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // Critical for BullMQ
});
