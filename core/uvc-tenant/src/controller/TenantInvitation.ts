import { Request, Response, NextFunction } from 'express';
import TenantInvitation, { TenantInvitationStatus } from '../models/TenantInvitation';
import { Types } from 'mongoose';
import Tenant from '../models/Tenant';
import { BadRequestError, NetworkAxios, NotFoundError, sendBrevoTemplateMail } from '@eduinteractive/uvc-common';

export const getUserInvitations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invitations = await TenantInvitation.find({
            mail: { $regex: new RegExp(`^${req.currentUser?.mail}$`, 'i') }, // case-insensitive regex
            status: TenantInvitationStatus.PENDING
        }).populate('tenant');
        res.status(200).json(invitations);
    } catch (err) {
        next(err);
    }
}

export const getTenantInvitations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }

        const invitations = await TenantInvitation.find({ tenant: new Types.ObjectId(tenantId), status: { $ne: TenantInvitationStatus.ACCEPTED } });
        res.status(200).json(invitations);
    } catch (err) {
        next(err);
    }
}

/** Admin: get all invitations for a tenant (any status). */
export const getTenantInvitationsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }

        const invitations = await TenantInvitation.find({ tenant: new Types.ObjectId(tenantId) }).sort({ date: -1 });
        res.status(200).json(invitations);
    } catch (err) {
        next(err);
    }
}

export const deleteTenantInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { invitationId } = req.params as { invitationId: string };
        const invitation = await TenantInvitation.findById(invitationId);
        if (!invitation) {
            throw new NotFoundError("Die Einladung konnte nicht gefunden werden.");
        }

        await invitation.deleteOne();
        res.status(200).send("Invitation deleted");
    } catch (err) {
        next(err);
    }
}

interface createInvitationRequest {
    mail: string;
    permissionLevel: number;
}

export const createInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createInvitationRequest;

        const existingInvitation = await TenantInvitation.findOne({ tenant: new Types.ObjectId(tenantId), mail: body.mail.toLowerCase() });
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new BadRequestError("Die Gruppe konnte nicht gefunden werden.");
        }

        if (existingInvitation) {
            existingInvitation.permissionLevel = body.permissionLevel;
            existingInvitation.status = TenantInvitationStatus.PENDING;
            existingInvitation.date = new Date();
            await existingInvitation.save();
            await sendBrevoTemplateMail({
                to: [{ email: body.mail }],
                templateId: 23,
                params: {
                    team: tenant.title,
                    mail: encodeURIComponent(body.mail),
                }
            })
        } else {
            const invitation = TenantInvitation.build({
                tenant: new Types.ObjectId(tenantId),
                mail: body.mail.toLowerCase(),
                date: new Date(),
                status: TenantInvitationStatus.PENDING,
                permissionLevel: body.permissionLevel,
            });
            await invitation.save();
            await sendBrevoTemplateMail({
                to: [{ email: body.mail }],
                templateId: 23,
                params: {
                    team: tenant.title,
                    mail: encodeURIComponent(body.mail),
                }
            })
        }

        res.status(201).send("Invitation created");
    } catch (err) {
        next(err);
    }
}

export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invitation = await TenantInvitation.findById(req.params.invitationId);
        if (!invitation) {
            throw new NotFoundError("Die Einladung konnte nicht gefunden werden.");
        }

        invitation.status = TenantInvitationStatus.ACCEPTED;
        await NetworkAxios.post(`http://uvc-auth-srv:3001/api/auth/network/tenant/${invitation.tenant}/user/add`, {
            mail: invitation.mail,
            permissionLevel: invitation.permissionLevel,
        });
        await invitation.save();

        res.status(200).send("Invitation accepted");
    } catch (err) {
        next(err)
    }
}

export const declineInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invitation = await TenantInvitation.findById(req.params.invitationId);
        if (!invitation) {
            throw new NotFoundError("Die Einladung konnte nicht gefunden werden.");
        }

        await invitation.deleteOne();

        res.status(200).send("Invitation declined");
    } catch (err) {
        next(err);
    }
}
