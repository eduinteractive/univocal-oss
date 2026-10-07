import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"
import { EVENT_ACCENTS, EVENT_LAYOUTS } from "../models/Event"

export const createEventChain = () => {
    return [
        ...createSVHMetadataChain(),
        body("startDate").isISO8601().toDate().withMessage("Start date must be a date"),
        body("endDate").optional().isISO8601().toDate().withMessage("End date must be a date"),
    ]
}

export const getEventChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID")
    ]
}

export const updateEventChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID"),
        body("startDate").optional().isISO8601().toDate().withMessage("Start date must be a date"),
        body("endDate").optional().isISO8601().toDate().withMessage("End date must be a date"),
        body("config").optional().customSanitizer((value) => typeof value === "string" ? JSON.parse(value) : value).isObject().withMessage("Config must be an object").bail(),
        body("config.toc").optional().isObject().withMessage("TOC must be an object").bail(),
        body("config.toc.enabled").optional().isBoolean().withMessage("TOC enabled must be a boolean").bail(),
        body("config.toc.content").optional().isString().withMessage("TOC content must be a string").bail(),
        body("config.toc.materials").optional().isArray().withMessage("TOC materials must be an array").bail(),
        body("config.toc.materials.*.title").isString().withMessage("Material title must be a string").bail(),
        body("config.toc.materials.*.link").isString().withMessage("Material link must be a string").bail(),
        body("config.toc.materials.*.mimetype").isString().withMessage("Material mimetype must be a string").bail(),
        body("config.toc.sessions").optional().isArray().withMessage("Programmpunkte müssen eine Liste sein.").bail()
            .custom((sessions: { start?: string; end?: string | null }[]) => {
                for (const session of sessions) {
                    if (session.end && new Date(session.end) < new Date(session.start || "")) {
                        throw new Error("Das Ende eines Programmpunkts muss nach dem Beginn liegen.");
                    }
                }
                return true;
            }),
        body("config.toc.sessions.*.id").isString().isLength({ min: 1, max: 80 }).withMessage("Ein Programmpunkt braucht eine Kennung.").bail(),
        body("config.toc.sessions.*.title").isString().isLength({ min: 1, max: 200 }).withMessage("Ein Programmpunkt braucht einen Titel.").bail(),
        body("config.toc.sessions.*.start").isISO8601().toDate().withMessage("Der Beginn eines Programmpunkts muss ein Datum sein.").bail(),
        body("config.toc.sessions.*.end").optional({ nullable: true }).isISO8601().toDate().withMessage("Das Ende eines Programmpunkts muss ein Datum sein.").bail(),
        body("config.toc.sessions.*.place").optional({ nullable: true }).isString().isLength({ max: 200 }).withMessage("Der Ort eines Programmpunkts ist zu lang.").bail(),
        body("config.toc.sessions.*.description").optional({ nullable: true }).isString().isLength({ max: 20000 }).withMessage("Die Beschreibung eines Programmpunkts ist zu lang.").bail(),
        body("config.registration").optional().isObject().withMessage("Registration must be an object").bail(),
        body("config.registration.enabled").optional().isBoolean().withMessage("Registration enabled must be a boolean").bail(),
        body("config.registration.capacity").optional({ nullable: true }).custom((value) => {
            if (value === null) return true;
            const capacity = Number(value);
            return Number.isInteger(capacity) && capacity >= 1;
        }).withMessage("Die Kapazität muss eine ganze Zahl ab 1 sein.").bail(),
        body("config.registration.fields").optional().isArray().withMessage("Registration fields must be an array").bail(),
        body("config.registration.fields.*.key").isString().withMessage("Field key must be a string").bail(),
        body("config.registration.fields.*.value").isString().withMessage("Field value must be a string").bail(),
        body("config.accreditation").optional().isObject().withMessage("Accreditation must be an object").bail(),
        body("config.accreditation.enabled").optional().isBoolean().withMessage("Accreditation enabled must be a boolean").bail(),
        body("config.accreditation.fields").optional().isArray().withMessage("Accreditation fields must be an array").bail(),
        body("config.accreditation.fields.*.key").isString().withMessage("Field key must be a string").bail(),
        body("config.accreditation.fields.*.value").isString().withMessage("Field value must be a string").bail(),
        body("config.public").optional().isObject().withMessage("Die öffentlichen Einstellungen müssen ein Objekt sein.").bail(),
        body("config.public.coverKey").optional({ nullable: true }).isString().withMessage("Das Titelbild ist ungültig.").bail(),
        body("config.public.accent").optional().isIn([...EVENT_ACCENTS]).withMessage("Die Akzentfarbe ist ungültig.").bail(),
        body("config.public.layout").optional().isIn([...EVENT_LAYOUTS]).withMessage("Das Layout ist ungültig.").bail(),
        body("config.public.published").optional().isBoolean().withMessage("Der Veröffentlichungsstatus muss ein Wahrheitswert sein.").bail(),
        body("place").optional().isObject().withMessage("Der Ort muss ein Objekt sein.").bail(),
        body("place.name").optional().isString().isLength({ max: 200 }).withMessage("Der Ortsname ist zu lang.").bail(),
        body("place.address").optional().isString().isLength({ max: 400 }).withMessage("Die Adresse ist zu lang.").bail(),
    ]
}

export const deleteEventChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID")
    ]
}