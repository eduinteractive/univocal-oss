import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"

export const createWikiChain = () => {
    return [
        ...createSVHMetadataChain()
    ]
}

export const getWikiChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID")
    ]
}

export const updateWikiChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID"),
        body("tableOfContents").optional().isArray().withMessage("Table of contents must be an array"),
        body("tableOfContents.*.title").isString().withMessage("Title must be a string"),
        body("tableOfContents.*.sectionId").isMongoId().withMessage("Section ID must be a valid Mongo ID"),
        body("tableOfContents.*.children").optional().isArray().withMessage("Children must be an array"),
        body("tableOfContents.*.children.*.title").isString().withMessage("Title must be a string"),
        body("tableOfContents.*.children.*.sectionId").isMongoId().withMessage("Section ID must be a valid Mongo ID"),
        body("tableOfContents.*.children.*.children").optional().isArray().withMessage("Children must be an array"),
    ]
}

export const deleteWikiChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID")
    ]
}

export const createWikiSectionChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID"),
        body("title").isString().withMessage("Title must be a string"),
        body("index").optional().isInt().withMessage("Index must be an integer"),
        body("parentId").optional().isMongoId().withMessage("Parent ID must be a valid Mongo ID"),
    ]
}

export const getWikiSectionChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID"),
        check("sectionId").isMongoId().withMessage("Section ID must be a valid Mongo ID")
    ]
}

export const updateWikiSectionChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID"),
        check("sectionId").isMongoId().withMessage("Section ID must be a valid Mongo ID"),
        body("title").optional().isString().withMessage("Title must be a string"),
        body("content").optional().isString().withMessage("Content must be a string"),
        body("materials").optional().customSanitizer((value) => typeof value === "string" ? JSON.parse(value) : value).isArray().withMessage("Materials must be an array"),
        body("materials.*.title").isString().withMessage("Material title must be a string"),
        body("materials.*.link").isString().withMessage("Material link must be a string"),
        body("materials.*.mimetype").isString().withMessage("Material mimetype must be a string"),
    ]
}

export const deleteWikiSectionChain = () => {
    return [
        check("wikiId").isMongoId().withMessage("Wiki ID must be a valid Mongo ID"),
        check("sectionId").isMongoId().withMessage("Section ID must be a valid Mongo ID")
    ]
}