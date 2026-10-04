import { NextFunction, Request, Response } from "express";
import { APIError } from "@eduinteractive/uvc-common";

class TooManyRequestsError extends APIError {
    constructor(message = "Zu viele Anfragen. Bitte versuche es später erneut.") {
        super("TooManyRequestsError", message, 429, true);
    }
}

interface RateLimitOptions {
    windowMs: number;
    max: number;
}

// In-memory per pod; good enough to throttle anonymous form spam.
export const rateLimit = ({ windowMs, max }: RateLimitOptions) => {
    const hits = new Map<string, { count: number; resetAt: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now();
        const key = req.ip ?? "unknown";
        const entry = hits.get(key);

        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
        } else {
            entry.count += 1;
            if (entry.count > max) {
                return next(new TooManyRequestsError());
            }
        }

        if (hits.size > 10000) {
            for (const [ip, value] of hits) {
                if (value.resetAt <= now) hits.delete(ip);
            }
        }
        next();
    };
};
