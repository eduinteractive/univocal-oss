import { body, check } from "express-validator"

export const updateUserGroupChain = () => {
    return [
        body("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!"),
        body("permissionLevel").isInt({ min: 0, max: 5 }).withMessage("Die Berechtigungsstufe ist ungültig!")
    ]
}

export const addUserToGroupChain = () => {
    return [
        body("mail").isString().isEmail().toLowerCase().withMessage("Die E-Mail-Adresse ist ungültig!"),
        body("permissionLevel").isInt({ min: 0, max: 5 }).withMessage("Die Berechtigungsstufe ist ungültig!"),
        body("authorization").optional().isString().withMessage("Die Autorisierung ist ungültig!")
    ]
}

export const removeUserFromGroupChain = () => {
    return [
        check("userId").isMongoId().withMessage("Die Benutzer-ID ist ungültig!"),
        check("tenantId").isMongoId().withMessage("Die Gruppen-ID ist ungültig!")
    ]
}