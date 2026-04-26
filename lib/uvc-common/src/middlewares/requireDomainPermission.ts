import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError';

export const requireDomainPermission = (req: Request, res: Response, next: NextFunction) => {
    const { domainId } = req.params as { domainId: string };
    if (!req.currentUser?.domains.includes(domainId)) {
        const error = new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        return next(error);
    }
    next();
}