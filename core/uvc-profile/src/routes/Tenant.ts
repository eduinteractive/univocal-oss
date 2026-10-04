import { Router } from "express";
import * as ProfileController from "../controller/Profile";
import * as NewsController from "../controller/News";
import * as ProjectController from "../controller/Project";
import * as SiteController from "../controller/Site";
import * as PageController from "../controller/ProfilePage";
import * as SupportController from "../controller/SupportRequest";
import { requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createProfileChain, updateProfileBackgroundChain, updateProfileChain } from "../controller/Profile.validate";
import { createNewsChain, deleteNewsChain, getNewsChain, updateNewsChain } from "../controller/News.validate";
import { createProjectChain, deleteProjectChain, getProjectChain, updateProjectChain } from "../controller/Project.validate";
import {
    checkSubdomainChain,
    createPageChain,
    createSupportRequestChain,
    pageIdChain,
    requestIdChain,
    responseIdChain,
    updatePageChain,
    updateSiteChain,
    updateSubdomainChain,
    updateSupportRequestChain,
    updateSupportResponseChain,
} from "../controller/Site.validate";

const TenantRouter = Router({ mergeParams: true });

// Profile Routes
TenantRouter.get("/", ProfileController.getProfile) // Get Profile
TenantRouter.post("/", createProfileChain(), validateRequestSchema, ProfileController.createProfile) // Create Profile
TenantRouter.put("/", requireTenantPermission('profile:update', false), uploader.single('avatarImage'), updateProfileChain(), validateRequestSchema, ProfileController.updateProfile) // Update Profile
TenantRouter.put("/background", requireTenantPermission('profile:update', false), uploader.single("backgroundImage"), updateProfileBackgroundChain(), validateRequestSchema, ProfileController.updateProfileBackground);

// Site Routes
TenantRouter.get("/site", SiteController.getSite);
TenantRouter.get("/site/preview", SiteController.getSitePreview);
TenantRouter.put("/site", requireTenantPermission('profile:update', false), updateSiteChain(), validateRequestSchema, SiteController.updateSite);
TenantRouter.get("/site/subdomain/check", checkSubdomainChain(), validateRequestSchema, SiteController.checkSubdomain);
TenantRouter.put("/site/subdomain", requireTenantPermission('profile:update', false), updateSubdomainChain(), validateRequestSchema, SiteController.updateSubdomain);
TenantRouter.put("/site/logo", requireTenantPermission('profile:update', false), uploader.single("logoImage"), SiteController.updateLogo);
TenantRouter.post("/site/gallery", requireTenantPermission('profile:update', false), uploader.array("images", 12), SiteController.addGalleryImages);

// Info Page Routes
TenantRouter.get("/pages", PageController.getPages);
TenantRouter.get("/pages/:pageId", pageIdChain(), validateRequestSchema, PageController.getPage);
TenantRouter.post("/pages", requireTenantPermission('profile_objects:create', false), createPageChain(), validateRequestSchema, PageController.createPage);
TenantRouter.put("/pages/:pageId", requireTenantPermission('profile_objects:edit', true), updatePageChain(), validateRequestSchema, PageController.updatePage);
TenantRouter.delete("/pages/:pageId", requireTenantPermission('profile_objects:delete', true), pageIdChain(), validateRequestSchema, PageController.deletePage);

// Support Request Routes
TenantRouter.get("/support-requests", SupportController.getSupportRequests);
TenantRouter.post("/support-requests", requireTenantPermission('profile_objects:create', false), createSupportRequestChain(), validateRequestSchema, SupportController.createSupportRequest);
TenantRouter.put("/support-requests/:requestId", requireTenantPermission('profile_objects:edit', true), updateSupportRequestChain(), validateRequestSchema, SupportController.updateSupportRequest);
TenantRouter.delete("/support-requests/:requestId", requireTenantPermission('profile_objects:delete', true), requestIdChain(), validateRequestSchema, SupportController.deleteSupportRequest);

// Support Responses contain personal data of outsiders, so only moderators+ may read them.
TenantRouter.get("/support-responses", requireTenantPermission('profile_objects:edit', false), SupportController.getSupportResponses);
TenantRouter.put("/support-responses/:responseId", requireTenantPermission('profile_objects:edit', false), updateSupportResponseChain(), validateRequestSchema, SupportController.updateSupportResponse);
TenantRouter.delete("/support-responses/:responseId", requireTenantPermission('profile_objects:delete', false), responseIdChain(), validateRequestSchema, SupportController.deleteSupportResponse);

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
