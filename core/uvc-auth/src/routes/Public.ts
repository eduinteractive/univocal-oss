import { currentUser, validateRequestSchema } from "@eduinteractive/uvc-common";
import { Router } from "express";
import * as AuthController from "../controller/Authentification";
import { loginChain, registerChain, resetPasswordChain, resetPasswordRepeatMailChain, resetPasswordWithTokenChain, verifyMailChain } from "../controller/Authentification.validate";
import * as UserController from "../controller/User";
import { isMailExistingChain } from "../controller/User.validate";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.post("/login", loginChain(), validateRequestSchema, AuthController.login);
PublicRouter.post("/register", registerChain(), validateRequestSchema, AuthController.register);
PublicRouter.post("/logout", currentUser, AuthController.logout);
PublicRouter.get("/check", AuthController.check);
PublicRouter.get("/refresh", AuthController.refresh);
PublicRouter.post("/reset-password", resetPasswordChain(), validateRequestSchema, AuthController.resetPassword);
PublicRouter.post("/reset-password-repeat", resetPasswordRepeatMailChain(), validateRequestSchema, AuthController.resetPasswordRepeatMail);
PublicRouter.post("/reset-password/:token", resetPasswordWithTokenChain(), validateRequestSchema, AuthController.resetPasswordWithToken);
PublicRouter.post("/verify", verifyMailChain(), validateRequestSchema, AuthController.verifyMail);
PublicRouter.post("/is-mail-existing", isMailExistingChain(), validateRequestSchema, UserController.isMailExisting);


PublicRouter.get("/dfn/login", AuthController.dfnLogin);
PublicRouter.get("/dfn/bridge", AuthController.dfnBridge);
PublicRouter.post("/dfn/exchange", AuthController.dfnExchange);

export default PublicRouter;