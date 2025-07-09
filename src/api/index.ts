import Router from 'koa-router';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';

const apiRouter = new Router({ prefix: '/api' });

apiRouter.use(authRouter.routes());
apiRouter.use(userRouter.routes());

export default apiRouter;