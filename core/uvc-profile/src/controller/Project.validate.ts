import { body, check } from "express-validator"

export const createProjectChain = () => {
    return [
        body("title").isString().withMessage("Title must be a string"),
        body("content").isString().withMessage("Content must be a string"),
        body("publishDate").optional().isISO8601().toDate().withMessage("Publish date must be a date"),
    ]
}

export const getProjectChain = () => {
    return [
        check("projectId").isMongoId().withMessage("Project ID must be a valid Mongo ID")
    ]
}

export const updateProjectChain = () => {
    return [
        check("projectId").isMongoId().withMessage("News ID must be a valid Mongo ID"),
        body("title").optional().isString().withMessage("Title must be a string"),
        body("content").optional().isString().withMessage("Content must be a string"),
        body("publishDate").optional().isISO8601().toDate().withMessage("Publish date must be a date"),
        body("image").optional().isString().withMessage("Image must be a string"),
        body("status").optional().isString().withMessage("Status must be a string"),
    ]
}

export const deleteProjectChain = () => {
    return [
        check("projectId").isMongoId().withMessage("News ID must be a valid Mongo ID")
    ]
}