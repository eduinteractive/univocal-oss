import { NextFunction, Request, Response } from "express";
import Project, { ProjectDoc } from "../models/Project";
import mongoose, { Types } from "mongoose";
import { ForbiddenError, hasReadPermission, NotFoundError, readSVH, readSVHQuery, SVHMetadataDoc, uploadFile } from "@eduinteractive/uvc-common";
import { ProfileObjectStatus } from "../models/Profile";

interface createProjectRequest {
    title: string;
    content: string;
    status?: ProfileObjectStatus;
    publishDate?: Date;
}

// Create a new Project

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createProjectRequest;
        const project = Project.build({
            tenantId: new Types.ObjectId(tenantId),
            authorId: new Types.ObjectId(req.currentUser?._id),
            title: body.title,
            content: body.content,
            status: body.status !== undefined ? body.status : ProfileObjectStatus.DRAFT,
        });
        if (body.status === ProfileObjectStatus.PUBLISHED) {
            project.publishDate = new Date();
        }
        if (req.file) {
            const location = await uploadFile(tenantId + "/" + project._id + "/" + req.file?.originalname, req.file)
            project.image = location;
        }
        await project.save({ session });
        await session.commitTransaction();
        res.status(201).json(project);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

// Get All Project

interface getProjectsQuery extends readSVHQuery {}

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getProjectsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId) };

        const project = await Project.find(condition).sort(svhFilter.sort);
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
}

// Get Single project

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("Project nicht gefunden!");
        }
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
}

// Update Project

interface updateProjectRequest {
    title?: string;
    content?: string;
    image?: string;
    status?: ProfileObjectStatus;
    publishDate?: Date;
}

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const body = req.body as updateProjectRequest;
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("Project nicht gefunden!");
        }
        if (!req.permission && !project.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        if (body.status === ProfileObjectStatus.PUBLISHED) {
            if (!project.publishDate) {
                project.publishDate = new Date();
            }
        } else if (body.status !== undefined) {
            project.publishDate = undefined;
        }
        project.set({
            title: body.title !== undefined ? body.title : project.title,
            content: body.content !== undefined ? body.content : project.content,
            status: body.status !== undefined ? body.status : project.status,
            image: body.image,
        });
        if (req.file) {
            const location = await uploadFile(tenantId + "/" + project._id + "/" + req.file?.originalname, req.file)
            project.image = location;
        }
        await project.save({ session });
        await session.commitTransaction();
        res.status(200).json(project);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

// Delete Project

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, tenantId } = req.params as { projectId: string, tenantId: string };
        const project = await Project.findById(projectId) as ProjectDoc;
        if (!hasReadPermission(project as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("Project nicht gefunden!");
        }
        if (!req.permission && !project.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        await project.deleteOne();
        res.status(200).send("Project gelöscht!");
    } catch (err) {
        next(err);
    }
}


