import { body, check } from "express-validator"
import { TenantVisibility } from "../models/Tenant"

export const createTenantChain = () => {
    return [
        body("title").isString().withMessage("title must be a string"),
        body("description").optional().isString().withMessage("description must be a string"),
        body("domain").optional().isString().withMessage("domain must be a string"),
        body("visibility")
            .isIn(Object.values(TenantVisibility))
            .withMessage(`visibility must be one of: ${Object.values(TenantVisibility).join(", ")}`),
        body("integrations").optional().isObject().withMessage("integrations must be an object"),
        body("integrations.dashboard").optional().isBoolean().withMessage("integrations.dashboard must be a boolean"),
        body("integrations.documentation").optional().isBoolean().withMessage("integrations.documentation must be a boolean"),
        body("integrations.calendar").optional().isBoolean().withMessage("integrations.calendar must be a boolean"),
        body("integrations.survey").optional().isBoolean().withMessage("integrations.survey must be a boolean"),
        body("integrations.chat").optional().isBoolean().withMessage("integrations.chat must be a boolean"),
        body("integrations.budget").optional().isBoolean().withMessage("integrations.budget must be a boolean"),
        body("integrations.knowledge").optional().isBoolean().withMessage("integrations.knowledge must be a boolean"),
        body("integrations.event").optional().isBoolean().withMessage("integrations.event must be a boolean"),
        body("integrations.project").optional().isBoolean().withMessage("integrations.project must be a boolean"),
    ]
}

export const updateTenantChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
        body("title").optional().isString().withMessage("title must be a string"),
        body("description").optional().isString().withMessage("description must be a string"),
        body("domain").optional().isString().withMessage("domain must be a string"),
        body("visibility")
            .optional()
            .isIn(Object.values(TenantVisibility))
            .withMessage(`visibility must be one of: ${Object.values(TenantVisibility).join(", ")}`),
        body("integrations").optional().isObject().withMessage("integrations must be an object"),
        body("integrations.dashboard").optional().isBoolean().withMessage("integrations.dashboard must be a boolean"),
        body("integrations.documentation").optional().isBoolean().withMessage("integrations.documentation must be a boolean"),
        body("integrations.calendar").optional().isBoolean().withMessage("integrations.calendar must be a boolean"),
        body("integrations.survey").optional().isBoolean().withMessage("integrations.survey must be a boolean"),
        body("integrations.chat").optional().isBoolean().withMessage("integrations.chat must be a boolean"),
        body("integrations.budget").optional().isBoolean().withMessage("integrations.budget must be a boolean"),
        body("integrations.knowledge").optional().isBoolean().withMessage("integrations.knowledge must be a boolean"),
        body("integrations.event").optional().isBoolean().withMessage("integrations.event must be a boolean"),
        body("integrations.project").optional().isBoolean().withMessage("integrations.project must be a boolean"),
    ]
}

export const deleteTenantChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
    ]
}

export const importTenantsChain = () => {
    return [
        body("domain").isMongoId().withMessage("domain must be a valid mongo id"),
        body("data").isArray().withMessage("data must be an array"),
        body("data.*.name").isString().withMessage("name must be a string"),
    ]
}

export const createNotificationChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
        body("content").isString().withMessage("content must be a string"),
    ]
}

export const deleteNotificationChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
        check("notificationId").isMongoId().withMessage("notificationId must be a valid mongo id"),
    ]
}

export const markNotificationAsSeenChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
        check("notificationId").isMongoId().withMessage("notificationId must be a valid mongo id"),
    ]
}

export const getPublicTenantChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
    ]
}