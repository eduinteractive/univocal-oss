import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "@eduinteractive/uvc-common";
import { ProfileObjectStatus, ProfileSectionType } from "../models/Profile";
import ProfilePage from "../models/ProfilePage";
import ProfileSupportRequest, { SupportRequestStatus } from "../models/ProfileSupportRequest";
import ProfileSupportResponse, { SupportResponseKind, SupportResponseStatus } from "../models/ProfileSupportResponse";
import { buildSitePayload, fetchSurveyResults, findPublishedProfileBySubdomain, isFeatured } from "../services/SiteResolver";

export const getPublicSite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subdomain } = req.params as { subdomain: string };
        const { profile, tenant } = await findPublishedProfileBySubdomain(subdomain);
        res.status(200).json(await buildSitePayload(profile, tenant));
    } catch (err) {
        next(err);
    }
}

export const getPublicSitePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subdomain, slug } = req.params as { subdomain: string, slug: string };
        const { profile, tenant } = await findPublishedProfileBySubdomain(subdomain);
        const page = await ProfilePage.findOne({ tenantId: profile.tenantId, slug: slug.toLowerCase(), status: ProfileObjectStatus.PUBLISHED });
        if (!page) {
            throw new NotFoundError("Seite nicht gefunden!");
        }
        res.status(200).json({
            tenant: { _id: profile.tenantId, title: tenant.title },
            page: {
                _id: page._id,
                title: page.title,
                slug: page.slug,
                content: page.content,
                publishDate: page.publishDate,
                updatedAt: page.updatedAt,
            },
        });
    } catch (err) {
        next(err);
    }
}

export const getPublicSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subdomain, requestId } = req.params as { subdomain: string, requestId: string };
        const { profile, tenant } = await findPublishedProfileBySubdomain(subdomain);
        const request = await ProfileSupportRequest.findOne({
            _id: new Types.ObjectId(requestId),
            tenantId: profile.tenantId,
            status: { $in: [SupportRequestStatus.PUBLISHED, SupportRequestStatus.CLOSED] },
        });
        if (!request) {
            throw new NotFoundError("Supportanfrage nicht gefunden!");
        }
        res.status(200).json({
            tenant: { _id: profile.tenantId, title: tenant.title },
            request: {
                _id: request._id,
                title: request.title,
                description: request.description,
                status: request.status,
                publishDate: request.publishDate,
            },
        });
    } catch (err) {
        next(err);
    }
}

interface createSupportResponseRequest {
    kind: SupportResponseKind;
    name?: string;
    email?: string;
    message: string;
    website?: string;
}

export const createPublicSupportResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subdomain, requestId } = req.params as { subdomain: string, requestId: string };
        const body = req.body as createSupportResponseRequest;

        // Honeypot field: real users never see or fill it.
        if (body.website) {
            res.status(201).json({ success: true });
            return;
        }

        const { profile } = await findPublishedProfileBySubdomain(subdomain);
        const request = await ProfileSupportRequest.findOne({
            _id: new Types.ObjectId(requestId),
            tenantId: profile.tenantId,
            status: SupportRequestStatus.PUBLISHED,
        });
        if (!request) {
            throw new BadRequestError("Diese Supportanfrage nimmt keine Antworten mehr entgegen.");
        }

        const response = ProfileSupportResponse.build({
            tenantId: profile.tenantId,
            requestId: request._id as Types.ObjectId,
            kind: body.kind,
            name: body.name?.trim() || undefined,
            email: body.email?.trim() || undefined,
            message: body.message.trim(),
            status: SupportResponseStatus.OPEN,
        });
        await response.save();
        res.status(201).json({ success: true });
    } catch (err) {
        next(err);
    }
}

export const getPublicSurveyResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subdomain, surveyId } = req.params as { subdomain: string, surveyId: string };
        const { profile } = await findPublishedProfileBySubdomain(subdomain);
        if (!isFeatured(profile, ProfileSectionType.SURVEYS, surveyId)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        res.status(200).json(await fetchSurveyResults(profile.tenantId.toString(), surveyId));
    } catch (err) {
        next(err);
    }
}
