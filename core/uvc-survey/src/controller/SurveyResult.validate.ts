import { check } from "express-validator"

export const getSurveyResultsChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
    ]
}

export const deleteSurveyResultChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        check("resultId").isMongoId().withMessage("Result ID must be a valid Mongo ID")
    ]
}

export const deleteSurveyResultsChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID")
    ]
}