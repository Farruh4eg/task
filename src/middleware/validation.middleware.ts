import { Context, Next } from 'koa';
import { ZodSchema, ZodError } from 'zod';

export function validationMiddleware(schema: ZodSchema) {
    return async (ctx: Context, next: Next) => {
        try {
            schema.parse(ctx.request.body);
        } catch (error) {
            if (error instanceof ZodError) {
                ctx.status = 400;
                ctx.body = {
                    message: 'Validation failed',
                    errors: error.flatten().fieldErrors,
                };
                return;
            }
            ctx.status = 500;
            ctx.body = { message: 'An unexpected error occurred during validation.' };
            return;
        }

        await next();
    };
}