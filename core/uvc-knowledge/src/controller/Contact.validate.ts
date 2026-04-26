import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"

export const createContactGroupChain = () => {
    return [
        ...createSVHMetadataChain()
    ]
}

export const getContactGroupChain = () => {
    return [
        check("contactGroupId").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID")
    ]
}

export const updateContactGroupChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("contactGroupId").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID")
    ]
}

export const deleteContactGroupChain = () => {
    return [
        check("contactGroupId").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID")
    ]
}

export const createContactChain = () => {
    return [
        body("contactGroupIds").isArray().withMessage("ContactGroup IDs must be an array"),
        body("contactGroupIds.*").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID"),
        body("firstName").optional().isString().withMessage("First name must be a string"),
        body("lastName").optional().isString().withMessage("Last name must be a string"),
        body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be a valid email"),
        body("phone").optional().isString().withMessage("Phone must be a string"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("street").optional().isString().withMessage("Street must be a string"),
        body("zip").optional({ values: "falsy" }).isNumeric().withMessage("Zip must be a number"),
        body("city").optional().isString().withMessage("City must be a string")
    ]
}

export const createMultipleContactsChain = () => {
    return [
        body("contacts").isArray().withMessage("Contacts must be an array"),
        body("contacts.*.contactGroupIds").isArray().withMessage("ContactGroup IDs must be an array"),
        body("contacts.*.contactGroupIds.*").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID"),
        body("contacts.*.firstName").optional().isString().withMessage("First name must be a string"),
        body("contacts.*.lastName").optional().isString().withMessage("Last name must be a string"),
        body("contacts.*.email").optional({ values: "falsy" }).isEmail().withMessage("Email must be a valid email"),
        body("contacts.*.phone").optional().isString().withMessage("Phone must be a string"),
        body("contacts.*.description").optional().isString().withMessage("Description must be a string"),
        body("contacts.*.street").optional().isString().withMessage("Street must be a string"),
        body("contacts.*.zip").optional({ values: "falsy" }).isNumeric().withMessage("Zip must be a number"),
        body("contacts.*.city").optional().isString().withMessage("City must be a string")
    ]
}

export const updateContactChain = () => {
    return [
        check("contactId").isMongoId().withMessage("Contact ID must be a valid Mongo ID"),
        body("contactGroupIds").optional().isArray().withMessage("ContactGroup IDs must be an array"),
        body("contactGroupIds.*").isMongoId().withMessage("ContactGroup ID must be a valid Mongo ID"),
        body("firstName").optional().isString().withMessage("First name must be a string"),
        body("lastName").optional().isString().withMessage("Last name must be a string"),
        body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be a valid email"),
        body("phone").optional().isString().withMessage("Phone must be a string"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("street").optional().isString().withMessage("Street must be a string"),
        body("zip").optional({ values: "falsy" }).isNumeric().withMessage("Zip must be a number"),
        body("city").optional().isString().withMessage("City must be a string")
    ]
}

export const deleteContactChain = () => {
    return [
        check("contactId").isMongoId().withMessage("Contact ID must be a valid Mongo ID")
    ]
}