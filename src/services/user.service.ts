// src/services/user.service.ts

import { Prisma } from '@prisma/client';
import prisma from "../lib/prisma";
import {ServiceResponse} from "../types/common.types";
import {AppErrorCode} from "../types/enums";

/**
 * Получает список всех пользователей (без паролей).
 */
export async function getAllUsers(): Promise<ServiceResponse<any>> {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            status: true,
        }
    });
    return { success: true, data: users };
}

/**
 * Получает одного пользователя по ID (без пароля).
 */
export async function getUserById(id: number): Promise<ServiceResponse<any>> {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            status: true,
        }
    });

    if (!user) {
        return {
            success: false,
            error: 'User not found.',
            errorCode: AppErrorCode.UserNotFound,
        };
    }

    return { success: true, data: user };
}

/**
 * Блокирует пользователя и удаляет все его активные сессии.
 */
export async function blockUser(id: number): Promise<ServiceResponse<any>> {
    try {
        const inactiveStatusId = 2; // 2 = inactive, но лучше не хардкодить :)

        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id },
                data: { status_id: inactiveStatusId },
            });

            await tx.sessions.deleteMany({
                where: { user_id: id },
            });

            return updatedUser;
        });

        return { success: true, data: { message: `User ${result.email} has been blocked.` } };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            // Ошибка "Record to update not found."
            return { success: false, error: 'User not found.', errorCode: AppErrorCode.UserNotFound };
        }

        console.error(error);
        return { success: false, error: 'Failed to block user.', errorCode: AppErrorCode.UserUpdateFailed };
    }
}