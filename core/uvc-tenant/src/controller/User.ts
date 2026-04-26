import { NextFunction, Request, Response } from "express";
import TenantNotification from "../models/TenantNotification";
import { Types } from "mongoose";
import Tenant, { TenantDoc, TenantVisibility } from "../models/Tenant";
import { AuthProvider, BadRequestError, NetworkAxios, NotFoundError } from "@eduinteractive/uvc-common";
import Domain, { DomainDoc } from "../models/Domain";

/** Ensures the current user’s home organisation domain matches the tenant’s domain (same rules as open join). */
export const assertUserDomainMatchesTenant = async (
    req: Request,
    tenant: TenantDoc
): Promise<void> => {
    let domain: DomainDoc | null = null;

    if (req.currentUser?.authProvider === AuthProvider.DFN_AAI) {
        const idpIdentifier = req.currentUser?.schacHomeOrganization;
        if (idpIdentifier) {
            domain = await Domain.findOne({ idpIdentifier: idpIdentifier });
        }
    }

    if (!domain || tenant.domain.toString() !== domain._id.toString()) {
        throw new BadRequestError("Die Gruppe ist nicht zugänglich.");
    }
};

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userGroups = req.currentUser?.groups.map(group => group._id);

        if (!userGroups) {
            res.status(200).json([]);
            return;
        }

        const unseenCount = await TenantNotification.countDocuments({ tenantId: { $in: userGroups }, seenBy: { $ne: new Types.ObjectId(req.currentUser!._id) } });
        const notifications = await TenantNotification.find({ tenantId: { $in: userGroups } }).populate('tenantId').limit(3).sort({ creationDate: -1 });

        res.status(200).json({
            unseenCount,
            notifications,
        });
    } catch (err) {
        next(err);
    }
}

export const markUserNotificationsAsSeen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userGroups = req.currentUser?.groups.map(group => group._id);

        if (!userGroups) {
            res.status(200).json([]);
            return;
        }

        await TenantNotification.updateMany({ tenantId: { $in: userGroups }, seenBy: { $ne: new Types.ObjectId(req.currentUser!._id) } }, { $push: { seenBy: new Types.ObjectId(req.currentUser!._id) } });

        res.status(200).json();
    } catch (err) {
        next(err);
    }
}

export const joinOpenNetworkTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params;
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }
        if (tenant.visibility !== TenantVisibility.PUBLIC) {
            throw new BadRequestError("Die Gruppe ist nicht zugänglich.");
        }

        await assertUserDomainMatchesTenant(req, tenant);

        await NetworkAxios.post(`http://uvc-auth-srv:3001/api/auth/network/tenant/${tenant._id}/user/add`, {
            mail: req.currentUser?.mail,
            permissionLevel: 0,
            authorization: process.env.JWT_ENCRYPTION_KEY
        });
        res.status(200).json();
    } catch (err) {
        next(err);
    }
}
