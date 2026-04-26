import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '@eduinteractive/uvc-common';
import Project from '../models/Project';
import ProjectTask from '../models/ProjectTask';

export const isProjectAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const project = await Project.findById(projectId);
        if (!project) {
            throw new NotFoundError("Projekt nicht gefunden!");
        }

        if (!req.permission && !project.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }

        next();
    } catch (err) {
        next(err)
    }
}

export const isTaskAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const project = await Project.findById(projectId);
        if (!project) {
            throw new NotFoundError("Projekt nicht gefunden!");
        }

        let isProjectAllowed = true;
        if (!req.permission && !project.authorId.equals(req.currentUser?._id)) {
            isProjectAllowed = false;
        }

        if (isProjectAllowed) {
            return next();
        }

        const { taskId } = req.params as { taskId: string };
        const task = await ProjectTask.findById(taskId);
        if (!task) {
            throw new NotFoundError("Task nicht gefunden!");
        }

        if (!req.permission && !task.owner?.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }

        next();
    } catch (err) {
        next(err)
    }
}