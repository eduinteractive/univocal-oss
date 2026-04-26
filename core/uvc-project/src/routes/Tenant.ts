import { Router } from "express";
import * as ProjectController from "../controller/Project";
import * as ProjectTaskController from "../controller/ProjectTask";
import { isProjectAuthor, isTaskAuthor } from "../middlewares/isProjectAuthor";
import { requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createTaskChain, deleteTaskChain, getTaskChain, updateTaskChain } from "../controller/ProjectTask.validate";
import { createProjectChain, deleteProjectChain, getProjectChain, updateProjectChain } from "../controller/Project.validate";

const TenantRouter = Router({ mergeParams: true });

TenantRouter.get("/project", ProjectController.getProjects);
TenantRouter.post("/project", requireTenantPermission('project:create', false), createProjectChain(), validateRequestSchema, ProjectController.createProject);
TenantRouter.get("/project/:projectId", getProjectChain(), validateRequestSchema, ProjectController.getProject)
TenantRouter.put("/project/:projectId", requireTenantPermission('project:edit', true), isProjectAuthor, updateProjectChain(), validateRequestSchema, ProjectController.updateProject);
TenantRouter.delete("/project/:projectId", requireTenantPermission('project:delete', true), isProjectAuthor, deleteProjectChain(), validateRequestSchema, ProjectController.deleteProject);

TenantRouter.post("/project/:projectId/task", requireTenantPermission('project:edit', false), isProjectAuthor, uploader.array("newUploads", 5), createTaskChain(), validateRequestSchema, ProjectTaskController.createTask);
TenantRouter.get("/project/:projectId/task/:taskId", getTaskChain(), validateRequestSchema, ProjectTaskController.getTask);
TenantRouter.put("/project/:projectId/task/:taskId", requireTenantPermission('project:edit', true), isTaskAuthor, uploader.array("newUploads", 5), updateTaskChain(), validateRequestSchema, ProjectTaskController.updateTask);
TenantRouter.delete("/project/:projectId/task/:taskId", requireTenantPermission('project:delete', true), isTaskAuthor, deleteTaskChain(), validateRequestSchema, ProjectTaskController.deleteTask);

export default TenantRouter;