import { Request, Response, NextFunction } from 'express';
import { RedisClient } from '../environment/createSVHService';
import { AuthentificationError } from '../errors/AuthentificationError';
import { ActivationStatus } from './currentUser';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.currentUser) {
            return res.status(401).send("Du bist nicht angemeldet!");
        }

        if (req.currentUser.activationStatus === ActivationStatus.NOT_VERIFIED) {
            return res.status(403).send("Dein Account wurde noch nicht aktiviert!");
        }

        if (req.currentUser.activationStatus === ActivationStatus.BANNED) {
            return res.status(403).send("Dein Account wurde gebannt!");
        }

        if (req.currentUser.activationStatus !== ActivationStatus.ACTIVATED) {
            return res.status(403).send("Dein Account wurde noch nicht aktiviert!");
        }

        const rAuthKey = await RedisClient.get("auth_invalidate_" + req.currentUser._id);
        if (rAuthKey) {
            throw new AuthentificationError("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
        }

        next();
    } catch (err) {
        next(err);
    }
}