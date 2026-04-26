import { check, body } from "express-validator"

export const recipientChain = () => {
    return [
        check("recipientId").isMongoId().withMessage("Recipient ID must be a valid Mongo ID")
    ]
}

export const tenantChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID")
    ]
}

export const sendPrivateMessageChain = () => {
    return [
        check("recipientId").isMongoId().withMessage("Recipient ID must be a valid Mongo ID"),
        body("content").optional().isString().withMessage("")
    ]
}

export const sendGroupMessageChain = () => {
    return [
        check("tenantId").isMongoId().withMessage("Tenant ID must be a valid Mongo ID"),
        body("content").optional().isString().withMessage("")
    ]
}