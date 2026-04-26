import { Request, Response, NextFunction } from 'express';
import { PERMISSION_LEVEL } from './currentUser';
import { ForbiddenError } from '../errors/ForbiddenError';

export const requirePermission = (permissionLevel: PERMISSION_LEVEL) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser?.permissionLevel || req.currentUser.permissionLevel < permissionLevel) {
            const error = new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
            return next(error);
        }
        next();
    }
}