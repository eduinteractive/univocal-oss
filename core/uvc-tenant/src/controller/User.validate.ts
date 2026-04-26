import { check } from "express-validator"

export const joinOpenNetworkTenantChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("tenantId must be a valid mongo id"),
    ]
}