import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError';
import { GROUP_PERMISSION_LEVEL, Groups, PERMISSION_LEVEL } from './currentUser';
import { AuthentificationError } from '../errors/AuthentificationError';
import { BadRequestError } from '../errors/BadRequestError';

declare global {
    namespace Express {
        interface Request {
            currentGroup?: Groups;
        }
    }
}


export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        return next(new AuthentificationError("Du bist nicht angemeldet!"))
    }

    if (!req.currentUser.groups) {
        return next(new BadRequestError("Du bist in keiner Gruppe!"))
    }

    const { tenantId } = req.params as { tenantId: string };
    if (!tenantId) {
        return next(new BadRequestError("Keine Tenant ID gefunden!"))
    }

    if (req.currentUser!.permissionLevel < PERMISSION_LEVEL.SV_HUB_MODERATION) {
        req.currentGroup = req.currentUser.groups.find(group => group._id === tenantId);
        if (!req.currentGroup) {
            const error = new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
            next(error);
        }
    } else {
        req.currentGroup = {
            _id: tenantId,
            permissionLevel: GROUP_PERMISSION_LEVEL.ADMIN
        }
    }
    next();
}