import Router from 'koa-router';
import {register, login, refresh, logout} from '../../controllers/auth.controller';
import {validationMiddleware} from "../../middleware/validation.middleware";
import {registerSchema, loginSchema, tokenSchema} from '../../validators/auth.validator';

const authRouter = new Router({ prefix: '/auth' });

authRouter.post('/register', validationMiddleware(registerSchema), register);
authRouter.post('/login', validationMiddleware(loginSchema), login);

authRouter.post('/refresh', validationMiddleware(tokenSchema), refresh);
authRouter.post('/logout', validationMiddleware(tokenSchema), logout);

export default authRouter;