import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { ForbiddenError, NotFoundError } from "@eduinteractive/uvc-common";
import ProfileSupportRequest, { ProfileSupportRequestDoc, SupportRequestStatus } from "../models/ProfileSupportRequest";
import ProfileSupportResponse, { SupportResponseStatus } from "../models/ProfileSupportResponse";

const findTenantRequest = async (tenantId: string, requestId: string) => {
    const request = await ProfileSupportRequest.findOne({ _id: new Types.ObjectId(requestId), tenantId: new Types.ObjectId(tenantId) });
    if (!request) {
        throw new NotFoundError("Supportanfrage nicht gefunden!");
    }
    return request;
};

const applyStatus = (request: ProfileSupportRequestDoc, status?: SupportRequestStatus) => {
    if (status === undefined) return;
    request.status = status;
    if (status === SupportRequestStatus.PUBLISHED && !request.publishDate) {
        request.publishDate = new Date();
    } else if (status === SupportRequestStatus.DRAFT) {
        request.publishDate = undefined;
    }
};

export const getSupportRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenantObjectId = new Types.ObjectId(tenantId);
        const requests = await ProfileSupportRequest.find({ tenantId: tenantObjectId }).sort({ updatedAt: -1 });
        const counts = await ProfileSupportResponse.aggregate<{ _id: Types.ObjectId; total: number; open: number }>([
            { $match: { tenantId: tenantObjectId } },
            {
                $group: {
                    _id: "$requestId",
                    total: { $sum: 1 },
                    open: { $sum: { $cond: [{ $eq: ["$status", SupportResponseStatus.OPEN] }, 1, 0] } },
                },
            },
        ]);
        res.status(200).json(requests.map((request) => {
            const count = counts.find((entry) => entry._id.equals(request._id as Types.ObjectId));
            return {
                ...request.toObject(),
                responseCount: count?.total ?? 0,
                openResponseCount: count?.open ?? 0,
            };
        }));
    } catch (err) {
        next(err);
    }
}

interface createSupportRequestRequest {
    title: string;
    description?: string;
    status?: SupportRequestStatus;
}

export const createSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createSupportRequestRequest;
        const request = ProfileSupportRequest.build({
            tenantId: new Types.ObjectId(tenantId),
            authorId: new Types.ObjectId(req.currentUser?._id),
            title: body.title,
            description: body.description ?? "",
            status: SupportRequestStatus.DRAFT,
        });
        applyStatus(request, body.status);
        await request.save();
        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
}

interface updateSupportRequestRequest {
    title?: string;
    description?: string;
    status?: SupportRequestStatus;
}

export const updateSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, requestId } = req.params as { tenantId: string, requestId: string };
        const body = req.body as updateSupportRequestRequest;
        const request = await findTenantRequest(tenantId, requestId);
        if (!req.permission && !request.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        if (body.title !== undefined) request.title = body.title;
        if (body.description !== undefined) request.description = body.description;
        applyStatus(request, body.status);
        await request.save();
        res.status(200).json(request);
    } catch (err) {
        next(err);
    }
}

export const deleteSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, requestId } = req.params as { tenantId: string, requestId: string };
        const request = await findTenantRequest(tenantId, requestId);
        if (!req.permission && !request.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
        await ProfileSupportResponse.deleteMany({ requestId: request._id });
        await request.deleteOne();
        res.status(200).send("Supportanfrage gelöscht!");
    } catch (err) {
        next(err);
    }
}

export const getSupportResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const { requestId, status } = req.query as { requestId?: string, status?: SupportResponseStatus };
        const condition: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };
        if (requestId && Types.ObjectId.isValid(requestId)) condition.requestId = new Types.ObjectId(requestId);
        if (status && Object.values(SupportResponseStatus).includes(status)) condition.status = status;
        const responses = await ProfileSupportResponse.find(condition).sort({ createdAt: -1 });
        res.status(200).json(responses);
    } catch (err) {
        next(err);
    }
}

export const updateSupportResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, responseId } = req.params as { tenantId: string, responseId: string };
        const { status } = req.body as { status: SupportResponseStatus };
        const response = await ProfileSupportResponse.findOne({ _id: new Types.ObjectId(responseId), tenantId: new Types.ObjectId(tenantId) });
        if (!response) {
            throw new NotFoundError("Antwort nicht gefunden!");
        }
        response.status = status;
        await response.save();
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteSupportResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, responseId } = req.params as { tenantId: string, responseId: string };
        const response = await ProfileSupportResponse.findOne({ _id: new Types.ObjectId(responseId), tenantId: new Types.ObjectId(tenantId) });
        if (!response) {
            throw new NotFoundError("Antwort nicht gefunden!");
        }
        await response.deleteOne();
        res.status(200).send("Antwort gelöscht!");
    } catch (err) {
        next(err);
    }
}
