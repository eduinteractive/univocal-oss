import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import Tenant, { TenantVisibility } from "../models/Tenant";
import TenantRequest, { TenantRequestStatus } from "../models/TenantRequest";
import { assertUserDomainMatchesTenant } from "./User";
import { BadRequestError, NetworkAxios, NotFoundError } from "@eduinteractive/uvc-common";

export const createUserTenantRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }
        if (tenant.visibility !== TenantVisibility.ON_REQUEST) {
            throw new BadRequestError("Für diese Gruppe ist keine Beitrittsanfrage möglich.");
        }

        await assertUserDomainMatchesTenant(req, tenant);

        const alreadyMember = req.currentUser?.groups.some((g) => g._id === tenantId);
        if (alreadyMember) {
            throw new BadRequestError("Du bist bereits Mitglied dieser Gruppe.");
        }

        const pending = await TenantRequest.findOne({
            tenant: new Types.ObjectId(tenantId),
            requesterId: new Types.ObjectId(req.currentUser!._id),
            status: TenantRequestStatus.PENDING,
        });
        if (pending) {
            throw new BadRequestError("Du hast bereits eine ausstehende Anfrage für diese Gruppe.");
        }

        const doc = TenantRequest.build({
            tenant: new Types.ObjectId(tenantId),
            requesterId: new Types.ObjectId(req.currentUser!._id),
            mail: req.currentUser!.mail.toLowerCase(),
            date: new Date(),
            status: TenantRequestStatus.PENDING,
        });
        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        next(err);
    }
};

export const getUserTenantRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const list = await TenantRequest.find({
            requesterId: new Types.ObjectId(req.currentUser!._id),
            status: TenantRequestStatus.PENDING,
        })
            .populate("tenant")
            .sort({ date: -1 });
        res.status(200).json(list);
    } catch (err) {
        next(err);
    }
};

export const cancelUserTenantRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params as { requestId: string };
        const doc = await TenantRequest.findById(requestId);
        if (!doc) {
            throw new NotFoundError("Die Anfrage wurde nicht gefunden.");
        }
        if (doc.requesterId.toString() !== req.currentUser!._id) {
            throw new BadRequestError("Du kannst diese Anfrage nicht zurückziehen.");
        }
        if (doc.status !== TenantRequestStatus.PENDING) {
            throw new BadRequestError("Diese Anfrage kann nicht mehr zurückgezogen werden.");
        }
        await doc.deleteOne();
        res.status(200).send("Tenant request withdrawn");
    } catch (err) {
        next(err);
    }
};

export const getTenantRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }
        const list = await TenantRequest.find({
            tenant: new Types.ObjectId(tenantId),
            status: TenantRequestStatus.PENDING,
        }).sort({ date: -1 });
        res.status(200).json(list);
    } catch (err) {
        next(err);
    }
};

interface acceptTenantRequestBody {
    permissionLevel?: number;
}

export const acceptTenantRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, requestId } = req.params as { tenantId: string; requestId: string };
        const body = req.body as acceptTenantRequestBody;
        const permissionLevel = body.permissionLevel ?? 0;

        const doc = await TenantRequest.findById(requestId);
        if (!doc || doc.tenant.toString() !== tenantId) {
            throw new NotFoundError("Die Anfrage wurde nicht gefunden.");
        }
        if (doc.status !== TenantRequestStatus.PENDING) {
            throw new BadRequestError("Diese Anfrage ist nicht mehr offen.");
        }

        await NetworkAxios.post(`http://uvc-auth-srv:3001/api/auth/network/tenant/${tenantId}/user/add`, {
            mail: doc.mail,
            permissionLevel,
        });

        doc.status = TenantRequestStatus.ACCEPTED;
        await doc.save();
        res.status(200).json(doc);
    } catch (err) {
        next(err);
    }
};

export const rejectTenantRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, requestId } = req.params as { tenantId: string; requestId: string };
        const doc = await TenantRequest.findById(requestId);
        if (!doc || doc.tenant.toString() !== tenantId) {
            throw new NotFoundError("Die Anfrage wurde nicht gefunden.");
        }
        if (doc.status !== TenantRequestStatus.PENDING) {
            throw new BadRequestError("Diese Anfrage ist nicht mehr offen.");
        }
        doc.status = TenantRequestStatus.REJECTED;
        await doc.save();
        res.status(200).json(doc);
    } catch (err) {
        next(err);
    }
};
