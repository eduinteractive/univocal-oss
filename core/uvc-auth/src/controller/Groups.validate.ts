import { body, check } from "express-validator"

export const MEMBER_BADGE_LIMIT = 8;
export const MEMBER_BADGE_MAX_LENGTH = 40;

export const normalizeMemberBadges = (badges: unknown): string[] => {
    if (!Array.isArray(badges)) {
        throw new Error("Die Funktionen sind ungültig!");
    }
    if (badges.length > MEMBER_BADGE_LIMIT) {
        throw new Error("Es sind höchstens 8 Funktionen erlaubt!");
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of badges) {
        if (typeof raw !== "string") {
            throw new Error("Jede Funktion muss ein Text sein!");
        }
        const label = raw.trim().replace(/\s+/g, " ");
        if (!label) {
            continue;
        }
        if (label.length > MEMBER_BADGE_MAX_LENGTH) {
            throw new Error("Eine Funktion darf höchstens 40 Zeichen lang sein!");
        }
        const key = label.toLowerCase();
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        result.push(label);
    }
    return result;
};

export const updateUserGroupChain = () => {
    return [
        body("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!"),
        body("permissionLevel").isInt({ min: 0, max: 5 }).withMessage("Die Berechtigungsstufe ist ungültig!")
    ]
}

export const addUserToGroupChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!"),
        body("permissionLevel").isInt({ min: 0, max: 5 }).withMessage("Die Berechtigungsstufe ist ungültig!"),
        body("authorization").optional().isString().withMessage("Die Autorisierung ist ungültig!")
    ]
}

export const updateUserBadgesChain = () => {
    return [
        body("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!"),
        body("badges").custom((value) => {
            normalizeMemberBadges(value);
            return true;
        }),
    ]
}

export const removeUserFromGroupChain = () => {
    return [
        check("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!"),
        check("tenantId").isMongoId().withMessage("Die Gruppen-ID ist ungültig!")
    ]
}