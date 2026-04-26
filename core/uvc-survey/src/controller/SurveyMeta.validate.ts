import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"
import { EXECUTION_MODE } from "../models/SurveyMeta"

export const createSurveyChain = () => {
    return [
        ...createSVHMetadataChain(),
        body("options").isObject().withMessage("Options must be an object"),
        body("options.executionMode").isIn(Object.keys(EXECUTION_MODE)).withMessage("Execution mode must be one of: " + Object.keys(EXECUTION_MODE).join(", "))
    ]
}

export const getSurveyChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID")
    ]
}

export const updateSurveyChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        body("options").optional().isObject().withMessage("Options must be an object"),
        body("options.executionMode").optional().isIn(Object.keys(EXECUTION_MODE)).withMessage("Execution mode must be one of: " + Object.keys(EXECUTION_MODE).join(", ")),
        body("options.isActive").optional().isBoolean().withMessage("Is active must be a boolean")
    ]
}

export const deleteSurveyChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID")
    ]
}

export const generateSurveyCodesChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        body("amount").isInt({ min: 1, max: 100 }).withMessage("Die Anzahl der Umfragecodes muss zwischen 1 und 100 liegen"),
    ]
}

export const resetSurveyCodesChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID")
    ]
}