import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = process.env.REDIS_URL
    ? {
        host: new URL(process.env.REDIS_URL).hostname,
        port: parseInt(new URL(process.env.REDIS_URL).port || '6379'),
        password: new URL(process.env.REDIS_URL).password,
        username: new URL(process.env.REDIS_URL).username,
        family: 4,
        maxRetriesPerRequest: null,
    } // Minimal parsing for IORedis/BullMQ compatibility using connection string usually works better directly, 
    // but breaking it down ensures standard IORedis behavior, OR we can pass url string directly to constructor.
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
    };

// If REDIS_URL is present, pass it directly string to IORedis constructor for best compatibility
export const connection = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 4 })
    : new IORedis(redisConfig);

export default connection;
