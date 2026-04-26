import { body, check, param } from "express-validator"

export const getTenantInvitationsAdminChain = () => [
    param("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
]

export const deleteTenantInvitationChain = () => {
    return [
        check("invitationId").isMongoId().withMessage("invitationId must be a valid mongo id"),
    ]
}

export const createInvitationChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
        body("mail").isEmail().withMessage("mail must be a valid email"),
        body("permissionLevel").isInt({ min: 0, max: 5 }).withMessage("permissionLevel must be a number"),
    ]
}

export const acceptInvitationChain = () => {
    return [
        check("invitationId").isMongoId().withMessage("invitationId must be a valid mongo id"),
    ]
}

export const declineInvitationChain = () => {
    return [
        check("invitationId").isMongoId().withMessage("invitationId must be a valid mongo id"),
    ]
}