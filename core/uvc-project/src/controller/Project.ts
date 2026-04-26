import { Request, Response, NextFunction } from "express";
import { createSVHMetadata, createSVHMetadataAttrs, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs } from "@eduinteractive/uvc-common";
import { Types } from "mongoose";
import Project, { ProjectDoc } from "../models/Project";
import ProjectTask from "../models/ProjectTask";

interface getProjectsQuery extends readSVHQuery { }

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getProjectsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };

        const projects = await Project.find(condition).sort(svhFilter.sort);
        res.status(200).json(projects);
    } catch (err) {
        next(err);
    }
}

interface createProjectRequest extends createSVHMetadataAttrs { }

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createProjectRequest;
        const projectAttrs = createSVHMetadata(req, body);
        const project = Project.build({
            ...projectAttrs,
            columns: [{
                _id: new Types.ObjectId(),
                title: "Aufgaben",
                tasks: []
            },
            {
                _id: new Types.ObjectId(),
                title: "In Bearbeitung",
                tasks: []
            },
            {
                _id: new Types.ObjectId(),
                title: "Erledigt",
                tasks: []
            }]
        });
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
}

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.")
        }
        const tasks = await ProjectTask.find({ _id: { $in: project.columns.flatMap((c) => c.tasks) } });
        const formattedResponse = {
            ...project.toJSON(),
            columns: project.columns.map((c) => ({
                _id: c._id, title: c.title,
                tasks: c.tasks.map((taskId) => tasks.find(t => t._id.equals(taskId)))
            }))
        }
        res.status(200).json(formattedResponse);
    } catch (err) {
        next(err);
    }
}

interface updateProjectRequest extends updateSVHMetadataAttrs {
    columns?: {
        _id: string;
        title: string;
        tasks: string[];
    }[]
}


export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateProjectRequest;
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.")
        }
        if (!req.permission && !project.authorId.equals(req.currentUser!._id)) {
            throw new NotFoundError("Du bist nicht berechtigt dieses Projekt zu bearbeiten.");
        }
        updateSVHMetadata(project, body)
        if (body.columns) {
            if (body.columns.length !== project.columns.length) {
                const oldTasks = project.columns.flatMap((c) => c.tasks);
                const newTasks = body.columns.flatMap((c) => c.tasks);
                const tasksToDelete = oldTasks.filter((t) => !newTasks.includes(t.toString()));
                for (const taskId of tasksToDelete) {
                    const task = await ProjectTask.findOne({ _id: new Types.ObjectId(taskId) });
                    if (task) {
                        await task.deleteOne();
                    }
                }
            }
            project.columns = body.columns !== undefined
                ? body.columns.map((c) => {
                    if (c._id) {
                        return { ...c, _id: new Types.ObjectId(c._id), tasks: c.tasks.map((t) => new Types.ObjectId(t)) }
                    } else {
                        return { _id: new Types.ObjectId(), title: c.title, tasks: c.tasks.map((t) => new Types.ObjectId(t)) }
                    }
                })
                : project.columns;
        }
        await project.save();
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
}

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.")
        }
        if (!req.permission && !project.authorId.equals(req.currentUser!._id)) {
            throw new NotFoundError("Du bist nicht berechtigt dieses Projekt zu löschen.");
        }
        for (const column of project.columns) {
            for (const taskId of column.tasks) {
                const task = await ProjectTask.findById(taskId);
                if (task) {
                    await task.deleteOne();
                }
            }
        }
        await project.deleteOne();
        res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export const resetProjectsACL = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const projects = await Project.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const project of projects) {
            project.authorId = new Types.ObjectId();
            await project.save();
        }
        res.status(200).send("Success");
    } catch (err) {
        next(err);
    }
}