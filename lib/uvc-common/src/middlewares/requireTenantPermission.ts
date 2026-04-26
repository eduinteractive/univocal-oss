import { Request, Response, NextFunction } from 'express';
import { GROUP_PERMISSION_LEVEL, PERMISSION_LEVEL } from './currentUser';
import { ForbiddenError } from '../errors/ForbiddenError';

const acl: Record<string, Array<GROUP_PERMISSION_LEVEL>> = {
    "tenant:administration": [GROUP_PERMISSION_LEVEL.ADMIN],
    "member:administration": [GROUP_PERMISSION_LEVEL.ADMIN],
    "calendar:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "calendar:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "calendar:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "profile:update": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "profile_objects:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "profile_objects:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "profile_objects:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "profile_objects:publish": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "budget:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "budget:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "budget:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "knowledge:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "knowledge:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "knowledge:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "survey:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "survey:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "survey:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "chat:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER, GROUP_PERMISSION_LEVEL.GUEST],
    "chat:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "notifications:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "event:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "event:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "event:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "project:create": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR, GROUP_PERMISSION_LEVEL.MEMBER],
    "project:edit": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
    "project:delete": [GROUP_PERMISSION_LEVEL.ADMIN, GROUP_PERMISSION_LEVEL.MODERATOR],
}

declare global {
    namespace Express {
        interface Request {
            permission?: boolean;
        }
    }
}

export const requireTenantPermission = (permission: keyof typeof acl, noError: boolean) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.permission = true
        if (req.currentUser!.permissionLevel < PERMISSION_LEVEL.SV_HUB_MODERATION) {
            const { tenantId } = req.params as { tenantId: string };
            const userGroup = req.currentUser?.groups.find((group) => group._id === tenantId);
            if (!userGroup) {
                const error = new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
                return next(error);
            }
            const userPermission = userGroup!.permissionLevel;
            if (!acl[permission].includes(userPermission)) {
                if (noError) {
                    req.permission = false;
                } else {
                    const error = new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
                    return next(error);
                }
            }
        }
        next();
    }
}