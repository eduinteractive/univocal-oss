import { body, check, param } from "express-validator";

export const createUserTenantRequestChain = () => [
    param("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
];

export const cancelUserTenantRequestChain = () => [
    param("requestId").isMongoId().withMessage("requestId must be a valid mongo id"),
];

export const acceptTenantRequestChain = () => [
    param("requestId").isMongoId().withMessage("requestId must be a valid mongo id"),
    body("permissionLevel")
        .optional()
        .isInt({ min: 0, max: 5 })
        .withMessage("permissionLevel must be an integer between 0 and 5"),
];

export const rejectTenantRequestChain = () => [
    param("requestId").isMongoId().withMessage("requestId must be a valid mongo id"),
];
