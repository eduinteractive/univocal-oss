import { Router } from "express";
import * as ProfileController from "../controller/Profile";
import * as NewsController from "../controller/News";
import * as ProjectController from "../controller/Project";
import { requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createProfileChain, updateProfileBackgroundChain, updateProfileChain } from "../controller/Profile.validate";
import { createNewsChain, deleteNewsChain, getNewsChain, updateNewsChain } from "../controller/News.validate";
import { createProjectChain, deleteProjectChain, getProjectChain, updateProjectChain } from "../controller/Project.validate";

const TenantRouter = Router({ mergeParams: true });

// Profile Routes
TenantRouter.get("/", ProfileController.getProfile) // Get Profile
TenantRouter.post("/", createProfileChain(), validateRequestSchema, ProfileController.createProfile) // Create Profile
TenantRouter.put("/", requireTenantPermission('profile:update', false), uploader.single('avatarImage'), updateProfileChain(), validateRequestSchema, ProfileController.updateProfile) // Update Profile
TenantRouter.put("/background", requireTenantPermission('profile:update', false), uploader.single("backgroundImage"), updateProfileBackgroundChain(), validateRequestSchema, ProfileController.updateProfileBackground);

// News Routes
TenantRouter.get("/news", NewsController.getAllNews) // Get all News
TenantRouter.get("/news/:newsId", getNewsChain(), validateRequestSchema, NewsController.getNews) // Get single News
TenantRouter.post("/news", requireTenantPermission('profile_objects:create', false), uploader.single('image'), createNewsChain(), validateRequestSchema, NewsController.createNews) // Create News
TenantRouter.put("/news/:newsId", requireTenantPermission('profile_objects:edit', true), uploader.single('image'), updateNewsChain(), validateRequestSchema, NewsController.updateNews) // Update News
TenantRouter.delete("/news/:newsId", requireTenantPermission('profile_objects:delete', true), deleteNewsChain(), validateRequestSchema, NewsController.deleteNews) // Delete News

// Project Routes
TenantRouter.get("/project", ProjectController.getProjects) // Get all News
TenantRouter.get("/project/:projectId", getProjectChain(), validateRequestSchema, ProjectController.getProject) // Get single News
TenantRouter.post("/project", requireTenantPermission('profile_objects:create', false), uploader.single('image'), createProjectChain(), validateRequestSchema, ProjectController.createProject) // Create News
TenantRouter.put("/project/:projectId", requireTenantPermission('profile_objects:edit', true), uploader.single('image'), updateProjectChain(), validateRequestSchema, ProjectController.updateProject) // Update News
TenantRouter.delete("/project/:projectId", requireTenantPermission('profile_objects:delete', true), deleteProjectChain(), validateRequestSchema, ProjectController.deleteProject) // Delete News

export default TenantRouter;