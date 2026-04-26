import { NextFunction, Request, Response } from "express";
import News, { NewsDoc } from "../models/News";
import mongoose, { Types } from "mongoose";
import { ForbiddenError, hasReadPermission, NotFoundError, readSVH, readSVHQuery, SVHMetadataDoc, uploadFile } from "@eduinteractive/uvc-common";
import { ProfileObjectStatus } from "../models/Profile";

interface createNewsRequest {
    title: string;
    content: string;
    publishDate?: Date;
    status?: ProfileObjectStatus;
}

// Create a new News

export const createNews = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createNewsRequest;
        const news = News.build({
            tenantId: new Types.ObjectId(tenantId),
            authorId: new Types.ObjectId(req.currentUser?._id),
            title: body.title,
            content: body.content,
            status: body.status !== undefined ? body.status : ProfileObjectStatus.DRAFT,
        });
        if (body.status === ProfileObjectStatus.PUBLISHED) {
            news.publishDate = new Date();
        }
        if (req.file) {
            const location = await uploadFile(tenantId + "/" + news._id + "/" + req.file?.originalname, req.file)
            news.image = location;
        }
        await news.save({ session });
        await session.commitTransaction();
        res.status(201).json(news);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

// Get All News

interface getAllNewsQuery extends readSVHQuery {}

export const getAllNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getAllNewsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId) };

        const news = await News.find(condition).sort(svhFilter.sort);
        res.status(200).json(news);
    } catch (err) {
        next(err);
    }
}

// Get Single news

export const getNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId, tenantId } = req.params as { newsId: string, tenantId: string };
        const news = await News.findById(newsId) as NewsDoc;
        if (!hasReadPermission(news as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("News nicht gefunden!");
        }
        res.status(200).json(news);
    } catch (err) {
        next(err);
    }
}

// Update News

interface updateNewsRequest {
    title?: string;
    content?: string;
    image?: string;
    status?: ProfileObjectStatus;
    publishDate?: Date;
}

export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { newsId, tenantId } = req.params as { newsId: string, tenantId: string };
        const body = req.body as updateNewsRequest;
        const news = await News.findById(newsId) as NewsDoc;
        if (!hasReadPermission(news as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("News nicht gefunden!");
        }
        if (!req.permission && !news.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        if (body.status === ProfileObjectStatus.PUBLISHED) {
            if (!news.publishDate) {
                news.publishDate = new Date();
            }
        } else if (body.status !== undefined) {
            news.publishDate = undefined;
        }
        news.set({
            title: body.title !== undefined ? body.title : news.title,
            content: body.content !== undefined ? body.content : news.content,
            status: body.status !== undefined ? body.status : news.status,
            image: body.image,
        });
        if (req.file) {
            const location = await uploadFile(tenantId + "/" + news._id + "/" + req.file?.originalname, req.file)
            news.image = location;
        }
        await news.save({ session });
        await session.commitTransaction();
        res.status(200).json(news);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

// Delete News

export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId, tenantId } = req.params as { newsId: string, tenantId: string };
        const news = await News.findById(newsId) as NewsDoc;
        if (!hasReadPermission(news as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("News nicht gefunden!");
        }
        if (!req.permission && !news.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        await news.deleteOne();
        res.status(200).send("News gelöscht!");
    } catch (err) {
        next(err);
    }
}