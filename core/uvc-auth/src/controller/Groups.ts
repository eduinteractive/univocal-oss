import { Response, Request, NextFunction } from 'express';
import UserAccount, { ActivationStatus, UserAccountDoc } from '../models/UserAccount';
import { UserContactDoc } from '../models/UserContact';
import { Types } from 'mongoose';
import { BadRequestError, ForbiddenError, GROUP_PERMISSION_LEVEL, NotFoundError, RedisClient, REQ_CLIENT } from '@eduinteractive/uvc-common';

export const getUsersByGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const isAdmin = req.query.isAdmin as unknown as boolean;
        const users = await UserAccount.find({ groups: { "$elemMatch": { _id: new Types.ObjectId(tenantId) } } }).populate('contact') as unknown as (UserAccountDoc & { contact: UserContactDoc })[];
        const responseData = users.map((user) => {
            const group = user.groups.find((group) => group._id.toString() === tenantId);
            return {
                _id: user._id,
                mail: isAdmin ? user.mail : undefined,
                firstName: user.contact.first_name,
                lastName: user.contact.last_name,
                group_id: group?._id,
                group_permission: group?.permissionLevel,
            }
        })

        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

export const getUsersInSameGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get users by currentUser Groups
        const users = await UserAccount.find({
            groups: { "$elemMatch": { _id: { $in: req.currentUser?.groups.map(group => new Types.ObjectId(group._id)) } } },
            activationStatus: ActivationStatus.ACTIVATED,
            _id: { $ne: new Types.ObjectId(req.currentUser?._id) }
        })
            .populate('contact') as unknown as (UserAccountDoc & { contact: UserContactDoc })[];
        const responseData = users.map((user) => {
            return {
                _id: user._id,
                firstName: user.contact.first_name,
                lastName: user.contact.last_name,
                activationStatus: user.activationStatus,
            }
        }).sort((a, b) => a.lastName.localeCompare(b.lastName));
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

interface updateUserGroupRequest {
    userId: string;
    permissionLevel: number;
}

export const updateUserGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params;
        const body = req.body as updateUserGroupRequest;
        const user = await UserAccount.findById(body.userId);
        if (!user) {
            throw new NotFoundError("Der Benutzer wurde nicht gefunden!");
        }
        const group = user.groups.find((group) => group._id.toString() === tenantId);
        if (!group) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden!");
        }
        group.permissionLevel = body.permissionLevel;
        user.markModified('groups');
        await RedisClient.set("auth_invalidate_" + user._id.toString(), "true");
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

interface addUserToGroupRequest {
    mail: string;
    permissionLevel: number;
    authorization?: string;
}

export const addUserToGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as addUserToGroupRequest;
        const user = await UserAccount.findOne({
            mail: { $regex: new RegExp(`^${body.mail}$`, 'i') } // case-insensitive regex
        });
        if (!user) {
            throw new NotFoundError("Der Benutzer wurde nicht gefunden!");
        }
        const group = user.groups.find((group) => group._id.toString() === tenantId);
        if (group) {
            throw new BadRequestError("Der Benutzer ist bereits in der Gruppe!");
        }
        if (body.authorization) {
            if (body.authorization !== process.env.JWT_ENCRYPTION_KEY) {
                throw new ForbiddenError("Sie haben keine Berechtigung, diese Aktion auszuführen!");
            }
        }
        user.groups.push({
            _id: new Types.ObjectId(tenantId),
            permissionLevel: body.permissionLevel,
        })
        if (req.client === REQ_CLIENT.WEB && req.currentUser?._id === user._id.toString()) {
            await RedisClient.set("auth_invalidate_" + req.currentUser._id.toString(), "true");
        }
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

export const removeUserFromGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, userId } = req.params;
        const user = await UserAccount.findById(userId);
        if (!user) {
            throw new NotFoundError("Der Benutzer wurde nicht gefunden!");
        }
        user.groups = user.groups.filter((group) => group._id.toString() !== tenantId);
        await RedisClient.set("auth_invalidate_" + userId, "true");
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}