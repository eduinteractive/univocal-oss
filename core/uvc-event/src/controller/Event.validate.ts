import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"

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
        body("config.registration").optional().isObject().withMessage("Registration must be an object").bail(),
        body("config.registration.enabled").optional().isBoolean().withMessage("Registration enabled must be a boolean").bail(),
        body("config.registration.fields").optional().isArray().withMessage("Registration fields must be an array").bail(),
        body("config.registration.fields.*.key").isString().withMessage("Field key must be a string").bail(),
        body("config.registration.fields.*.value").isString().withMessage("Field value must be a string").bail(),
        body("config.accreditation").optional().isObject().withMessage("Accreditation must be an object").bail(),
        body("config.accreditation.enabled").optional().isBoolean().withMessage("Accreditation enabled must be a boolean").bail(),
        body("config.accreditation.fields").optional().isArray().withMessage("Accreditation fields must be an array").bail(),
        body("config.accreditation.fields.*.key").isString().withMessage("Field key must be a string").bail(),
        body("config.accreditation.fields.*.value").isString().withMessage("Field value must be a string").bail(),
    ]
}

export const deleteEventChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID")
    ]
}