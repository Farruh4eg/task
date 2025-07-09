import { Prisma } from '@prisma/client';
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from '../utils/hash.util';
import { generateTokens } from '../utils/jwt.util';
import { calculateExpiryDate } from '../utils/date.util';
import {AppErrorCode} from "../types/enums";
import {ServiceResponse} from "../types/common.types";
import config from '../config';
import {RegisterUserInput, TokenInput} from "../validators/auth.validator";
import jwt from "jsonwebtoken";


export async function registerUser(userData: RegisterUserInput): Promise<ServiceResponse<any>> {
    try {
        const hashedPassword = await hashPassword(userData.password);

        const newUser = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                last_name: userData.last_name,
                first_name: userData.first_name,
                patronymic: userData.patronymic || '',
                birth_date: userData.birth_date,
                role_id: 2, // user
                status_id: 1, // active
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
            }
        });

        return { success: true, data: newUser };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return {
                success: false,
                error: 'User with this email already exists.',
                errorCode: AppErrorCode.EmailAlreadyExists,
            };
        }

        console.error(error);
        return {
            success: false,
            error: 'Failed to register user due to a server error.',
            errorCode: AppErrorCode.ServerError,
        };
    }
}


type LoginData = Pick<Prisma.UserCreateInput, 'email' | 'password'>;

export async function loginUser(loginData: LoginData, ipAddress: string, userAgent: string): Promise<ServiceResponse<any>> {
    const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: { role: true, status: true }
    });

    const invalidCredentialsError = {
        success: false,
        error: 'Invalid email or password.',
        errorCode: AppErrorCode.InvalidCredentials,
    };

    if (!user || !(await comparePassword(loginData.password, user.password))) {
        return invalidCredentialsError;
    }

    if (user.status.name !== 'active') {
        return {
            success: false,
            error: 'User account is not active.',
            errorCode: AppErrorCode.AccountInactive,
        };
    }

    const tokens = generateTokens({
        userId: user.id,
        roleId: user.role_id,
        statusId: user.status_id,
    });

    await prisma.sessions.create({
        data: {
            refresh_token: tokens.refreshToken,
            user_id: user.id,
            ip_address: ipAddress,
            user_agent: userAgent,
            expires_at: calculateExpiryDate(config.jwt.refresh.expiresIn),
        }
    });

    user.password = ''

    return {
        success: true,
        data: {
            ...tokens,
            user,
        }
    };
}

export async function refreshToken(tokenInput: TokenInput, ipAddress: string, userAgent: string): Promise<ServiceResponse<any>> {
    const { refreshToken } = tokenInput;

    try {
        const decoded = jwt.verify(refreshToken, config.jwt.refresh.secret) as { userId: number };

        const session = await prisma.sessions.findUnique({
            where: { refresh_token: refreshToken },
        });

        if (!session) {
            return { success: false, error: 'Invalid refresh token.', errorCode: AppErrorCode.InvalidCredentials };
        }

        // Token Rotation
        await prisma.sessions.delete({
            where: { refresh_token: refreshToken },
        });

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role_id: true,
                status_id: true,
            }
        })

        if (!user) {
            return { success: false, error: 'User not found', errorCode: AppErrorCode.UserNotFound };
        }

        const newTokens = generateTokens({
            userId: user.id,
            roleId: user.role_id,
            statusId: user.status_id
        });

        await prisma.sessions.create({
            data: {
                user_id: decoded.userId,
                refresh_token: newTokens.refreshToken,
                ip_address: ipAddress,
                user_agent: userAgent,
                expires_at: calculateExpiryDate(config.jwt.refresh.expiresIn),
            },
        });

        return { success: true, data: newTokens };

    } catch (error) {
        return { success: false, error: 'Invalid or expired refresh token.', errorCode: AppErrorCode.InvalidCredentials };
    }
}

export async function logoutUser(tokenInput: TokenInput): Promise<ServiceResponse<any>> {
    const { refreshToken } = tokenInput;

    const { count } = await prisma.sessions.deleteMany({
        where: { refresh_token: refreshToken },
    });

    if (count === 0) {
        // Можно вернуть ошибку, но не обязательно.

    }

    return { success: true, data: { message: 'Successfully logged out.' } };
}