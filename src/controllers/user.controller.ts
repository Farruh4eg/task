import { Context } from 'koa'
import * as UserService from '../services/user.service'
import { AppErrorCode } from "../types/enums";

export async function getAllUsers(ctx: Context) {
    if (ctx.state.user.role.name !== 'admin') {
        ctx.status = 403;
        ctx.body = { message: "Access denied. Admin rights required." }
        return;
    }

    const result = await UserService.getAllUsers();

    ctx.status = 200;
    ctx.body = result.data;
}

export async function getUserById(ctx: Context) {
    const requestedId = parseInt(ctx.params.id);
    const { id: currentUserId, role } = ctx.state.user;

    if (role.name !== 'admin' && currentUserId !== requestedId) {
        ctx.status = 403;
        ctx.body = { message: "Access denied." }
        return;
    }

    const result = await UserService.getUserById(requestedId);
    if (!result.success) {
        ctx.status = result.errorCode === AppErrorCode.UserNotFound ? 404 : 500;
        ctx.body = { message: result.error };
        return;
    }

    ctx.status = 200;
    ctx.body = result.data;
}

export async function blockUser(ctx: Context) {
    const requestedId = parseInt(ctx.params.id);
    const { id: currentUserId, role } = ctx.state.user;

    if (role.name !== 'admin' || currentUserId !== requestedId) {
        ctx.status = 403;
        ctx.body = { message: "Access denied." }
        return;
    }

    const result = await UserService.blockUser(requestedId);

    if (!result.success) {
        ctx.status = result.errorCode === AppErrorCode.UserNotFound ? 404 : 500;
        ctx.body = { message: result.error };
        return;
    }

    ctx.status = 200;
    ctx.body = result.data;
}