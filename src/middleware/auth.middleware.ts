import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import config from '../config';
import prisma from "../lib/prisma";

export async function authMiddleware(ctx: Context, next: Next) {
    const authHeader = ctx.request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { message: 'Authorization header missing or invalid.' };
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.access.secret) as {userId: number}

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            },
            include: {
                role: true,
                status: true
            },
            omit: {
                password: true
            }
        })

        if (!user) {
            ctx.status = 401;
            ctx.body = { message: 'Invalid token'};
        }

        ctx.state.user = user;
    } catch (error) {
        ctx.status = 401;
        ctx.body = { message: 'Invalid or expired token'};
        return;
    }

    await next();
}