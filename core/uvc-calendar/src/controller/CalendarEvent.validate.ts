import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"

export const getCalendarEventChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID")
    ]
}

export const createCalendarEventChain = () => {
    return [
        ...createSVHMetadataChain(),
        body("location").optional().isString().withMessage("Location must be a string"),
        body("notes").optional().isString().withMessage("Notes must be a string"),
        body("startDate").isISO8601().toDate().withMessage("Start date must be a date"),
        body("endDate").isISO8601().toDate().withMessage("End date must be a date"),
        body("color").optional().isString().withMessage("Color must be a string"),
        body('materials').customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Materials must be an array').bail(),
        body('materials.*.title').isString().withMessage('Title must be a string').bail(),
        body('materials.*.link').isString().withMessage('Link must be a string').bail(),
        body('materials.*.mimetype').isString().withMessage('Mimetype must be a string').bail(),
    ]
}

export const updateCalendarEventChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID"),
        body("location").optional().isString().withMessage("Location must be a string"),
        body("notes").optional().isString().withMessage("Notes must be a string"),
        body("startDate").optional().isISO8601().toDate().withMessage("Start date must be a date"),
        body("endDate").optional().isISO8601().toDate().withMessage("End date must be a date"),
        body("color").optional().isString().withMessage("Color must be a string"),
        body('materials').customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Materials must be an array').bail(),
        body('materials.*.title').isString().withMessage('Title must be a string').bail(),
        body('materials.*.link').isString().withMessage('Link must be a string').bail(),
        body('materials.*.mimetype').isString().withMessage('Mimetype must be a string').bail(),
    ]
}

export const deleteCalendarEventChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID")
    ]
}

export const getCalendarEventIcalChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID"),
    ]
}