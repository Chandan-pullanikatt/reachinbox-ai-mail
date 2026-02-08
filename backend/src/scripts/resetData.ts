import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const resetData = async () => {
    console.log('Using database URL:', process.env.DATABASE_URL);

    // Clear Database
    try {
        console.log('Cleaning database...');
        const deleted = await prisma.scheduledEmail.deleteMany({});
        console.log(`Deleted ${deleted.count} scheduled emails from database.`);
    } catch (error) {
        console.error('Error clearing database:', error);
    }

    // Clear Redis
    try {
        console.log('Cleaning Redis...');

        // Use the same Redis config logic as in src/config/redis.ts
        const redisConfig = process.env.REDIS_URL
            ? {
                host: new URL(process.env.REDIS_URL).hostname,
                port: parseInt(new URL(process.env.REDIS_URL).port || '6379'),
                password: new URL(process.env.REDIS_URL).password,
                username: new URL(process.env.REDIS_URL).username,
                family: 4,
                maxRetriesPerRequest: null,
            }
            : {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                maxRetriesPerRequest: null,
            };

        const redis = process.env.REDIS_URL
            ? new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: null,
                tls: { rejectUnauthorized: false }
            })
            : new Redis(redisConfig);

        await redis.flushall();
        console.log('Redis flushed successfully.');
        await redis.quit();
    } catch (error) {
        console.error('Error clearing Redis:', error);
    }

    await prisma.$disconnect();
    console.log('Data reset complete!');
};

resetData();
