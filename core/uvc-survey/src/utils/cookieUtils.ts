import { Request, Response } from "express";
import { randomBytes } from "crypto";

const COOKIE_NAME = "svh_visitor_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 Jahr in Millisekunden

/**
 * Generiert eine eindeutige Visitor-ID
 * @returns Eine zufällige hexadezimale ID
 */
function generateVisitorId(): string {
    return randomBytes(16).toString("hex");
}

/**
 * Ruft die Visitor-ID aus dem Cookie ab oder erstellt eine neue
 * @param req Express Request-Objekt
 * @param res Express Response-Objekt
 * @returns Die Visitor-ID
 */
export function getOrCreateVisitorId(req: Request, res: Response): string {
    // Versuche, bestehende ID aus Cookie zu lesen
    let visitorId = req.cookies?.[COOKIE_NAME];

    // Falls keine ID vorhanden ist, generiere eine neue
    if (!visitorId) {
        visitorId = generateVisitorId();
        // Setze Cookie mit HttpOnly, SameSite und Secure-Flags
        res.cookie(COOKIE_NAME, visitorId, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true, // Schutz vor XSS
            sameSite: "lax", // CSRF-Schutz
            secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Production
            path: "/",
        });
    }

    return visitorId;
}

/**
 * Liest die Visitor-ID aus dem Cookie (ohne neue zu erstellen)
 * @param req Express Request-Objekt
 * @returns Die Visitor-ID oder undefined
 */
export function getVisitorId(req: Request): string | undefined {
    return req.cookies?.[COOKIE_NAME];
}

