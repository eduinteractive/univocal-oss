import { body, check } from "express-validator"

export const createAttendeeChain = () => {
    return [
        check("eventId").isMongoId().withMessage("Event ID must be a valid Mongo ID"),
        body("personal").isObject().withMessage("Personal must be an object").bail(),
        body("personal.firstName").isString().withMessage("First name must be a string").bail(),
        body("personal.lastName").isString().withMessage("Last name must be a string").bail(),
        body("personal.email").isEmail().withMessage("Email must be a valid email").bail(),
        body("customFields").optional().isObject().withMessage("Custom fields must be an object").bail(),
    ]
}