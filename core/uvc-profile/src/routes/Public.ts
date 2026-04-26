import { Router } from "express";
import * as PublicController from "../controller/Public";
import { getNewsChain } from "../controller/News.validate";
import { getProjectChain } from "../controller/Project.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common/build/middlewares/validateRequest";
import { getProfileChain } from "../controller/Profile.validate";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.get("/news", PublicController.getAllPublicNews);
PublicRouter.get("/news/:newsId", getNewsChain(), validateRequestSchema, PublicController.getSinglePublicNews);
PublicRouter.get("/projects", PublicController.getAllPublicProjects);
PublicRouter.get("/projects/:projectId", getProjectChain(), validateRequestSchema, PublicController.getSinglePublicProject);
PublicRouter.get("/profile", PublicController.getPublicProfiles);
PublicRouter.get("/profile/:tenantId", getProfileChain(), validateRequestSchema, PublicController.getPublicProfile);
PublicRouter.get("/dashboard", PublicController.getDashboard);

export default PublicRouter;