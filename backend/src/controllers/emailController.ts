import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { emailQueue } from '../queue/emailQueue';
import { z } from 'zod';

const ScheduleSchema = z.object({
    senderId: z.string().email(),
    subject: z.string().min(1),
    body: z.string().min(1),
    recipients: z.array(z.string().email()).min(1),
    startTime: z.string().datetime(),
    delaySeconds: z.number().min(0).default(0),
    hourlyLimit: z.number().min(1).default(100),
});

export const scheduleEmails = async (req: Request, res: Response) => {
    try {
        const data = ScheduleSchema.parse(req.body);
        const { senderId, subject, body, recipients, startTime, delaySeconds, hourlyLimit } = data;

        const startTimestamp = new Date(startTime).getTime();
        const now = Date.now();

        const jobsToCreate = recipients.map((recipient, index) => {
            // Calculate individual scheduled time based on delay
            // E.g. 1st email at start, 2nd at start+delay, etc.
            const scheduledTime = startTimestamp + (index * delaySeconds * 1000);

            return {
                recipient,
                subject,
                body,
                status: 'PENDING',
                scheduledAt: new Date(scheduledTime),
                senderId,
            };
        });

        const createdEmails = jobsToCreate.map(job => ({
            ...job,
            id: crypto.randomUUID()
        }));

        // 1. Persist to DB using createMany for performance
        // We chunk it to avoid parameter limits if it's huge
        const CHUNK_SIZE = 1000;
        for (let i = 0; i < createdEmails.length; i += CHUNK_SIZE) {
            const chunk = createdEmails.slice(i, i + CHUNK_SIZE);
            await prisma.scheduledEmail.createMany({
                data: chunk
            });
        }

        // 2. Add to BullMQ
        const queuePromises = createdEmails.map(async (email) => {
            const delay = Math.max(0, email.scheduledAt.getTime() - Date.now());

            await emailQueue.add('send-email', {
                id: email.id,
                senderId,
                recipient: email.recipient,
                subject,
                body,
                hourlyLimit,
                minDelaySeconds: delaySeconds,
            }, {
                jobId: email.id,
                delay,
            });
        });

        await Promise.all(queuePromises);

        res.json({
            success: true,
            message: `Scheduled ${createdEmails.length} emails.`,
            count: createdEmails.length,
        });

    } catch (error: any) {
        // Safe logging to avoid console crash on complex error objects
        console.error('Schedule Error:', error instanceof Error ? error.message : String(error));
        if (error instanceof z.ZodError) {
            console.error("Schedule Validation Error: Invalid Data provided.");
            res.status(400).json({ error: "Validation Error", details: error.errors });
            return;
        }
        res.status(400).json({ error: error.message || 'Invalid Request' });
    }
};

export const getEmails = async (req: Request, res: Response) => {
    try {
        const { senderId } = req.query;
        if (!senderId) return res.status(400).json({ error: 'Sender ID required' });

        const emails = await prisma.scheduledEmail.findMany({
            where: { senderId: String(senderId) },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const { senderId } = req.query;
        if (!senderId) return res.status(400).json({ error: 'Sender ID required' });

        const [pending, sent, failed] = await Promise.all([
            prisma.scheduledEmail.count({
                where: {
                    senderId: String(senderId),
                    status: { in: ['PENDING', 'RESCHEDULED', 'PROCESSING'] }
                }
            }),
            prisma.scheduledEmail.count({
                where: {
                    senderId: String(senderId),
                    status: { in: ['SENT', 'COMPLETED'] }
                }
            }),
            prisma.scheduledEmail.count({
                where: {
                    senderId: String(senderId),
                    status: 'FAILED'
                }
            }),
        ]);

        res.json({ pending, sent, failed });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const toggleStar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isStarred } = req.body;

        const email = await prisma.scheduledEmail.update({
            where: { id },
            data: { isStarred }
        });

        res.json(email);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
