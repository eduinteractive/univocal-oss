import { Request, Response, NextFunction } from "express"
import { Types } from "mongoose";
import Project, { ProjectDoc } from "../models/Project";
import { deleteFile, hasReadPermission, NotFoundError, sendPushNotification, uploadFiles } from "@eduinteractive/uvc-common";
import ProjectTask from "../models/ProjectTask";

interface createTaskRequest {
    title: string;
    description?: string;
    subtasks?: {
        _id: string;
        title: string;
        description?: string;
        dueDate?: Date;
        owner?: string;
        done?: boolean;
    }[];
    dueDate?: Date;
    color?: string;
    owner?: string;
    connectors?: {
        origin: string;
        target: string;
    }[];
    colId?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[]
}

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createTaskRequest;
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.");
        }
        const column = project.columns.find((c) => c._id.toString() === body.colId);
        if (!column) {
            throw new NotFoundError("Die Spalte konnte nicht gefunden werden.");
        }
        const task = ProjectTask.build({
            title: body.title,
            description: body.description,
            subtasks: body.subtasks?.map((t) => ({ ...t, _id: new Types.ObjectId(), owner: t.owner !== undefined ? new Types.ObjectId(t.owner) : undefined })) || [],
            dueDate: body.dueDate || undefined,
            color: body.color || undefined,
            owner: body.owner ? new Types.ObjectId(body.owner) : undefined,
            connectors: body.connectors || [],
            materials: [],
        })
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(tenantId + "/" + task._id, req.files);
            task.materials = fileData.map(file => ({
                title: file.fileName,
                link: file.url,
                mimetype: file.mimeType
            }));
        }
        await task.save();
        column.tasks.push(task._id);
        project.markModified("columns");
        await project.save();
        res.status(201).json(task);
        if (task.owner && task.owner.toString() !== req.currentUser!._id.toString()) {
            await sendPushNotification({
                title: "Neue Aufgabe",
                message: `Die Aufgabe "${task.title}" im Projekt "${project.title}" wurde für dich erstellt.`,
                userId: task.owner.toString(),
                permissionLevel: project.viewAccess
            }, req);
        }
    } catch (err) {
        next(err);
    }
}

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId, projectId, tenantId } = req.params as { taskId: string, projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.");
        }
        const task = await ProjectTask.findById(taskId);
        if (!task) {
            throw new NotFoundError("Die Aufgabe konnte nicht gefunden werden.");
        }
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
}

interface updateTaskRequest {
    title?: string;
    description?: string;
    subtasks?: {
        _id: string;
        title: string;
        description?: string;
        dueDate?: Date;
        owner?: string;
        done?: boolean;
    }[];
    dueDate?: Date;
    color?: string;
    owner?: string;
    connectors?: {
        origin: string;
        target: string;
    }[];
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
}

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateTaskRequest;
        const { taskId, projectId, tenantId } = req.params as { taskId: string, projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.");
        }
        const task = await ProjectTask.findById(taskId);
        if (!task) {
            throw new NotFoundError("Die Aufgabe konnte nicht gefunden werden.");
        }
        task.title = body.title !== undefined ? body.title : task.title;
        task.description = body.description !== undefined ? body.description : task.description;
        task.subtasks = body.subtasks !== undefined ? body.subtasks.map((t) => {
            if (t._id) {
                return {
                    _id: new Types.ObjectId(t._id),
                    title: t.title,
                    description: t.description,
                    dueDate: t.dueDate,
                    owner: t.owner ? new Types.ObjectId(t.owner) : undefined,
                    done: t.done,
                }
            } else {
                return {
                    _id: new Types.ObjectId(),
                    title: t.title,
                    description: t.description,
                    dueDate: t.dueDate,
                    owner: t.owner ? new Types.ObjectId(t.owner) : undefined,
                    done: t.done
                }
            }
        }) : task.subtasks;
        task.dueDate = body.dueDate !== undefined ? body.dueDate : task.dueDate;
        task.color = body.color !== undefined ? body.color : task.color;
        task.owner = body.owner !== undefined ? body.owner ? new Types.ObjectId(body.owner) : undefined : task.owner;
        task.connectors = body.connectors !== undefined ? body.connectors : task.connectors;

        const materialsToDelete = task.materials.filter(material => !body.materials?.some(newMaterial => newMaterial.link === material.link));
        for (const material of materialsToDelete) {
            await deleteFile(material.link);
        };

        task.materials = body.materials;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(tenantId + "/" + task._id, req.files);
            task.materials = [
                ...body.materials,
                ...fileData.map(file => ({
                    title: file.fileName,
                    link: file.url,
                    mimetype: file.mimeType
                }))
            ];
            task.markModified("materials");
        }
        await task.save();
        res.status(200).json(task);
        if (task.owner && task.owner.toString() !== req.currentUser!._id.toString()) {
            await sendPushNotification({
                title: "Aufgabe aktualisiert",
                message: `Deine Aufgabe "${task.title}" im Projekt "${project.title}" wurde aktualisiert.`,
                userId: task.owner.toString(),
                permissionLevel: project.viewAccess
            }, req);
        }
    } catch (err) {
        next(err);
    }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId, projectId, tenantId } = req.params as { taskId: string, projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Projekt konnte nicht gefunden werden.");
        }
        const task = await ProjectTask.findById(taskId);
        if (!task) {
            throw new NotFoundError("Die Aufgabe konnte nicht gefunden werden.");
        }
        const column = project.columns.find((c) => c.tasks.includes(task._id));
        if (column) {
            column.tasks = column.tasks.filter((t) => t.toString() !== task._id.toString());
            project.markModified("columns");
            await project.save();
        }
        task.materials.forEach(async material => {
            await deleteFile(material.link);
        });
        await task.deleteOne();
        res.status(200).json(task);
        if (task.owner && task.owner.toString() !== req.currentUser!._id.toString()) {
            await sendPushNotification({
                title: "Aufgabe gelöscht",
                message: `Deine Aufgabe "${task.title}" im Projekt "${project.title}" wurde gelöscht.`,
                userId: task.owner.toString(),
                permissionLevel: project.viewAccess
            }, req);
        }
    } catch (err) {
        next(err);
    }
}