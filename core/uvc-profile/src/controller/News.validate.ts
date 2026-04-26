import { body, check } from "express-validator"

export const createNewsChain = () => {
    return [
        body("title").isString().withMessage("Title must be a string"),
        body("content").isString().withMessage("Content must be a string"),
        body("publishDate").optional().isISO8601().toDate().withMessage("Publish date must be a date"),
    ]
}

export const getNewsChain = () => {
    return [
        check("newsId").isMongoId().withMessage("News ID must be a valid Mongo ID")
    ]
}

export const updateNewsChain = () => {
    return [
        check("newsId").isMongoId().withMessage("News ID must be a valid Mongo ID"),
        body("title").optional().isString().withMessage("Title must be a string"),
        body("content").optional().isString().withMessage("Content must be a string"),
        body("publishDate").optional().isISO8601().toDate().withMessage("Publish date must be a date"),
        body("image").optional().isString().withMessage("Image must be a string"),
        body("status").optional().isString().withMessage("Status must be a string"),
    ]
}

export const deleteNewsChain = () => {
    return [
        check("newsId").isMongoId().withMessage("News ID must be a valid Mongo ID")
    ]
}