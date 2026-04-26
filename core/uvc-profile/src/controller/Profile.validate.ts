import { body, check } from "express-validator"

export const createProfileChain = () => {
    return [
        body("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("contactPerson").optional().isString().withMessage("Contact person must be a string"),
        body("contactEmail").optional().isEmail().withMessage("Contact email must be an email"),
        body("contactPhone").optional().isString().withMessage("Contact phone must be a string"),
        body("contactWebsite").optional().isString().withMessage("Contact website must be a string"),
        body("publicPerson").optional().isString().withMessage("Public person must be a string"),
    ]
}

export const getProfileChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID")
    ]
}

export const updateProfileChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("contactPerson").optional().isString().withMessage("Contact person must be a string"),
        body("contactEmail").optional().isEmail().withMessage("Contact email must be an email"),
        body("contactPhone").optional().isString().withMessage("Contact phone must be a string"),
        body("contactWebsite").optional().isString().withMessage("Contact website must be a string"),
        body("publicPerson").optional().isString().withMessage("Public person must be a string"),
        body("avatarImage").optional().isString().withMessage("Avatar image must be a string"),
    ]
}

export const updateProfileBackgroundChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID"),
        body("backgroundImage").optional().isString().withMessage("Background image must be a string"),
    ]
}

export const deleteProfileChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID")
    ]
}