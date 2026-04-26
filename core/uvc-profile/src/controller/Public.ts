import { NextFunction, Request, Response } from "express";
import News from "../models/News";
import Project from "../models/Project";
import Profile, { ProfileObjectStatus } from "../models/Profile";
import { NetworkAxios, NotFoundError } from "@eduinteractive/uvc-common";
import { Types } from "mongoose";
import axios from "axios";

export const getAllPublicNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, tenantId } = req.query;
        let query: { status: ProfileObjectStatus, tenantId?: string } = { status: ProfileObjectStatus.PUBLISHED };
        if (tenantId) {
            query = { ...query, tenantId: tenantId as string };
        }
        const news = await News.find(query).limit(limit ? +limit : 10).sort({ publishDate: -1 });
        res.status(200).json(news);
    } catch (err) {
        next(err);
    }
}

export const getSinglePublicNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params as { newsId: string };
        const news = await News.findById(newsId);
        if (!news || news.status !== ProfileObjectStatus.PUBLISHED) {
            throw new NotFoundError("SV-News nicht gefunden!");
        }
        res.status(200).json(news);
    } catch (err) {
        next(err);
    }
}

export const getAllPublicProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, tenantId } = req.query as { limit: string, tenantId: string };
        let query: { status: ProfileObjectStatus, tenantId?: string } = { status: ProfileObjectStatus.PUBLISHED };
        if (tenantId) {
            query = { ...query, tenantId: tenantId as string };
        }
        const projects = await Project.find(query).limit(limit ? +limit : 10).sort({ publishDate: -1 });
        res.status(200).json(projects);
    } catch (err) {
        next(err);
    }
}

export const getSinglePublicProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const project = await Project.findById(projectId);
        if (!project || project.status !== ProfileObjectStatus.PUBLISHED) {
            throw new NotFoundError("SV-Projekt nicht gefunden!");
        }
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
}

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const profile = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) });
        if (!profile) {
            throw new NotFoundError("SV-Profil nicht gefunden!");
        }
        const news = await News.find({ tenantId: new Types.ObjectId(tenantId), status: ProfileObjectStatus.PUBLISHED }).limit(3).sort({ publishDate: -1 });
        const projects = await Project.find({ tenantId: new Types.ObjectId(tenantId), status: ProfileObjectStatus.PUBLISHED }).limit(3).sort({ publishDate: -1 });
        const tenant = await NetworkAxios.get("http://uvc-tenant-srv:3002/api/tenant/public/tenant/" + tenantId);
        res.status(200).json({
            profile: {
                ...profile.toObject(),
                title: tenant.data.title,
                type: tenant.data.type
            },
            news,
            projects,
        });
    } catch (err) {
        next(err);
    }
}

interface getPublicProfilesQuery {
    search?: string;
}

export const getPublicProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query as getPublicProfilesQuery;
        const profiles = await Profile.find();
        const tenants = await NetworkAxios.get("http://uvc-tenant-srv:3002/api/tenant/public/tenant");
        
        const tenantMap = new Map<string, { title: string, type: string }>(tenants.data.map((tenant: any) => [tenant._id, {
            title: tenant.title as string,
            type: tenant.type as string
        }]));

        const profilesWithTenant = profiles.map((profile) => ({
            ...profile.toObject(),
            title: tenantMap.get(profile.tenantId.toString())?.title,
            type: tenantMap.get(profile.tenantId.toString())?.type
        }));

        let result = profilesWithTenant;
        if (search) {
            result = result.filter((profile) => {
                return profile.title?.toLowerCase().includes(search?.toLowerCase() ?? "");
            });
        }

        result = result.sort((a, b) => a.title?.localeCompare(b.title ?? "") ?? 0);

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

interface getDashboardQuery {
    search?: string;
    cursor?: string;
    type?: "ALL" | "NEWS" | "PROJECTS";
}

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cursor, type, search } = req.query as getDashboardQuery;

        const tenants = await NetworkAxios.get("http://uvc-tenant-srv:3002/api/tenant/public/tenant");

        const cursorCondition = cursor ? { publishDate: { $lt: new Date(cursor) } } : {};
        const searchCondition = search ? { $or: [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }] } : {};

        const tenantMap = new Map(tenants.data.map((tenant: any) => [tenant._id, tenant.type]));

        const news = await News.find({ status: ProfileObjectStatus.PUBLISHED, tenantId: { $in: tenants.data.map((tenant: any) => new Types.ObjectId(tenant._id as string)) }, ...cursorCondition, ...searchCondition }).limit(5).sort({ publishDate: -1 });
        const projects = await Project.find({ status: ProfileObjectStatus.PUBLISHED, tenantId: { $in: tenants.data.map((tenant: any) => new Types.ObjectId(tenant._id as string)) }, ...cursorCondition, ...searchCondition }).limit(5).sort({ publishDate: -1 });

        let result = news.map((news) => ({
            ...news.toObject(),
            type: "NEWS",
        })).concat(projects.map((project) => ({
            ...project.toObject(),
            type: "PROJECTS",
        }))).sort((a, b) => new Date(b.publishDate!).getTime() - new Date(a.publishDate!).getTime());

        if (type !== "ALL" && type !== undefined) {
            result = result.filter((item) => item.type === type);
        }

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}