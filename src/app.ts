import koa from 'koa';
import bodyParser from 'koa-bodyparser'
import config from './config';
import apiRouter from "./api";

const app = new koa();

app.use(async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            message: "Internal server error. " + error,
        };
    }
})

app.use(bodyParser());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
}

export default app;