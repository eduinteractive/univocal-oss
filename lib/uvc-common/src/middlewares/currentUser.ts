import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthentificationError } from '../errors/AuthentificationError';

export enum ActivationStatus {
    NOT_VERIFIED = "NOT_VERIFIED",
    ACTIVATED = "ACTIVATED",
    BANNED = "BANNED",
}

export enum AuthProvider {
    LOCAL = "LOCAL",
    DFN_AAI = "DFN_AAI",
}

export enum PERMISSION_LEVEL {
    GUEST = 0,
    SV_HUB_MEMBER = 1,
    SV_MEMBER = 2,
    SSR_MEMBER = 3,
    SSR_BOARD = 4,
    SSR_ADMIN = 5,
    SV_HUB_MODERATION = 6,
    SV_HUB_ADMINISTRATION = 7,
}

export enum GROUP_PERMISSION_LEVEL {
    GUEST = 0,
    MEMBER = 1,
    MODERATOR = 2,
    ADMIN = 3,
}

export interface Groups {
    _id: string,
    permissionLevel: GROUP_PERMISSION_LEVEL,
}

export interface UserPayload {
    _id: string,
    mail: string,
    permissionLevel: PERMISSION_LEVEL,
    groups: Groups[],
    domains: string[],
    dataProtectionAgreement: boolean,
    activationStatus: ActivationStatus,
    authProvider?: AuthProvider,
    schacHomeOrganization?: string,
    lastSignDate: string,
    registerDate: string,
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export let currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return next();
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_ENCRYPTION_KEY! as string
        ) as UserPayload;

        req.currentUser = payload;
        next();
    } catch (err) {
        next(new AuthentificationError("Du bist nicht angemeldet!"));
    }
}