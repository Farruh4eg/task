import Router from "koa-router";
import { getAllUsers, getUserById, blockUser } from "../../controllers/user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRouter = new Router({prefix: '/users'});

userRouter.use(authMiddleware);

userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.patch('/:id/block', blockUser);

export default userRouter;