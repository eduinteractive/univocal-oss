import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "@eduinteractive/uvc-common";
import ProfilePage, { ProfilePageDoc } from "../models/ProfilePage";
import { ProfileObjectStatus } from "../models/Profile";
import { isValidSlug, slugify } from "../utils/Subdomain";

const resolveUniqueSlug = async (tenantId: string, desired: string, excludeId?: Types.ObjectId) => {
    const base = slugify(desired) || "seite";
    let candidate = base;
    let counter = 2;
    while (await ProfilePage.exists({
        tenantId: new Types.ObjectId(tenantId),
        slug: candidate,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })) {
        candidate = `${base}-${counter++}`;
    }
    return candidate;
};

const findTenantPage = async (tenantId: string, pageId: string) => {
    const page = await ProfilePage.findOne({ _id: new Types.ObjectId(pageId), tenantId: new Types.ObjectId(tenantId) });
    if (!page) {
        throw new NotFoundError("Seite nicht gefunden!");
    }
    return page;
};

const applyStatus = (page: ProfilePageDoc, status?: ProfileObjectStatus) => {
    if (status === undefined) return;
    page.status = status;
    if (status === ProfileObjectStatus.PUBLISHED) {
        if (!page.publishDate) page.publishDate = new Date();
    } else {
        page.publishDate = undefined;
    }
};

export const getPages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const pages = await ProfilePage.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ updatedAt: -1 });
        res.status(200).json(pages);
    } catch (err) {
        next(err);
    }
}

export const getPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, pageId } = req.params as { tenantId: string, pageId: string };
        res.status(200).json(await findTenantPage(tenantId, pageId));
    } catch (err) {
        next(err);
    }
}

interface createPageRequest {
    title: string;
    slug?: string;
    content?: string;
    status?: ProfileObjectStatus;
}

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createPageRequest;
        if (body.slug && !isValidSlug(body.slug)) {
            throw new BadRequestError("Die URL darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.");
        }
        const page = ProfilePage.build({
            tenantId: new Types.ObjectId(tenantId),
            authorId: new Types.ObjectId(req.currentUser?._id),
            title: body.title,
            slug: await resolveUniqueSlug(tenantId, body.slug || body.title),
            content: body.content ?? "",
            status: ProfileObjectStatus.DRAFT,
        });
        applyStatus(page, body.status);
        await page.save();
        res.status(201).json(page);
    } catch (err) {
        next(err);
    }
}

interface updatePageRequest {
    title?: string;
    slug?: string;
    content?: string;
    status?: ProfileObjectStatus;
}

export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, pageId } = req.params as { tenantId: string, pageId: string };
        const body = req.body as updatePageRequest;
        const page = await findTenantPage(tenantId, pageId);
        if (!req.permission && !page.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        if (body.slug !== undefined) {
            if (!isValidSlug(body.slug)) {
                throw new BadRequestError("Die URL darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.");
            }
            page.slug = await resolveUniqueSlug(tenantId, body.slug, page._id as Types.ObjectId);
        }
        if (body.title !== undefined) page.title = body.title;
        if (body.content !== undefined) page.content = body.content;
        applyStatus(page, body.status);
        await page.save();
        res.status(200).json(page);
    } catch (err) {
        next(err);
    }
}

export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, pageId } = req.params as { tenantId: string, pageId: string };
        const page = await findTenantPage(tenantId, pageId);
        if (!req.permission && !page.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        await page.deleteOne();
        res.status(200).send("Seite gelöscht!");
    } catch (err) {
        next(err);
    }
}
