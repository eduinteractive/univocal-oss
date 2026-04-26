import { body, check } from "express-validator"

export const createDomainChain = () => {
    return [
        body("title").isString().withMessage("Titel muss ein String sein"),
        body("shortcode").isString().withMessage("Kürzel muss ein String sein"),
        body("idpIdentifier").optional().isString().withMessage("IDP Identifier muss ein String sein")
    ]
}

export const getDomainChain = () => {
    return [
        check("domainId").isMongoId().withMessage("Domain ID muss eine gültige Mongo ID sein")
    ]
}

export const updateDomainChain = () => {
    return [
        check("domainId").isMongoId().withMessage("Domain ID muss eine gültige Mongo ID sein"),
        body("title").optional().isString().withMessage("Titel muss ein String sein"),
        body("shortcode").optional().isString().withMessage("Kürzel muss ein String sein"),
        body("idpIdentifier").optional().isString().withMessage("IDP Identifier muss ein String sein")
    ]
}

export const deleteDomainChain = () => {
    return [
        check("domainId").isMongoId().withMessage("Domain ID muss eine gültige Mongo ID sein")
    ]
}