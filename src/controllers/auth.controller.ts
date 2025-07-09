import { Context } from 'koa'
import * as AuthService from '../services/auth.service'
import { AppErrorCode } from "../types/enums";
import {RegisterUserInput, LoginUserInput, TokenInput} from '../validators/auth.validator';

export async function register(ctx: Context) {
    const result = await AuthService.registerUser(ctx.request.body as RegisterUserInput);

    if (!result.success) {
        switch (result.errorCode) {
            case AppErrorCode.EmailAlreadyExists:
                ctx.status = 409;
                break;
            default:
                ctx.status = 500;
        }
        ctx.body = { message: result.error };
        return;
    }

    ctx.status = 201;
    ctx.body = result.data;
}

export async function login(ctx: Context) {
    const result = await AuthService.loginUser(
        ctx.request.body as LoginUserInput,
        ctx.request.ip,
        ctx.request.headers['user-agent'] || ''
    );

    if (!result.success) {
        switch (result.errorCode) {
            case AppErrorCode.InvalidCredentials:
                ctx.status = 401;
                break;
            case AppErrorCode.AccountInactive:
                    ctx.status = 403;
                    break;
            default:
                ctx.status = 500;
        }
        ctx.body = { message: result.error };
        return;
    }

    ctx.status = 200;
    ctx.body = result.data;
}

export async function refresh(ctx: Context) {
    const result = await AuthService.refreshToken(ctx.request.body as TokenInput, ctx.request.ip, ctx.request.headers['user-agent'] || '');

    if (!result.success) {
        ctx.status = 401;
        ctx.body = { message: result.error };
        return;
    }

    ctx.status = 200;
    ctx.body = result.data;
}

export async function logout(ctx: Context) {
    const result = await AuthService.logoutUser(ctx.request.body as TokenInput);
    ctx.status = 200;
    ctx.body = result.data;
}