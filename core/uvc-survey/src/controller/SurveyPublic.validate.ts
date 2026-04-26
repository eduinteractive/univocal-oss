import { body, check } from "express-validator"

export const createSurveyResultChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        body("personal").optional().isObject().withMessage("Personal must be an object"),
        body("personal.identifier").optional().isString().withMessage("Identifier must be a string"),
        body("answers").isObject().withMessage("Answers must be an object")
    ]
}