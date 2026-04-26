import { body, check } from "express-validator"
import { SurveyComponentNominalType, SurveyComponentType } from "../models/SurveyComponent"

export const createSurveyComponentChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        body("title").isString().withMessage("Title must be a string"),
        body("required").optional().isBoolean().withMessage("Required must be a boolean"),
        body("type").isIn(Object.keys(SurveyComponentType)).withMessage("Type must be one of: " + Object.keys(SurveyComponentType).join(", ")),
        body("previous").optional().isMongoId().withMessage("Previous must be a valid Mongo ID"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("scale").optional().isObject().withMessage("Scale must be an object"),
        body("scale.labels").optional().isArray().withMessage("Labels must be an array"),
        body("choices").optional().isArray().withMessage("Choices must be an array"),
        body("multiple").optional().isBoolean().withMessage("Multiple must be a boolean"),
        body("max").optional().isInt().withMessage("Max must be an integer"),
        body("nominalType").optional().isIn(Object.keys(SurveyComponentNominalType)).withMessage("Nominal type must be one of: " + Object.keys(SurveyComponentNominalType).join(", "))
    ]
}

export const updateSurveyComponentChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        check("componentId").isMongoId().withMessage("Component ID must be a valid Mongo ID"),
        body("title").optional().isString().withMessage("Title must be a string"),
        body("required").optional().isBoolean().withMessage("Required must be a boolean"),
        body("description").optional().isString().withMessage("Description must be a string"),
        body("scale").optional().isObject().withMessage("Scale must be an object"),
        body("scale.labels").optional().isArray().withMessage("Labels must be an array"),
        body("choices").optional().isArray().withMessage("Choices must be an array"),
        body("multiple").optional().isBoolean().withMessage("Multiple must be a boolean"),
        body("max").optional().isInt().withMessage("Max must be an integer"),
        body("nominalType").optional().isIn(Object.keys(SurveyComponentNominalType)).withMessage("Nominal type must be one of: " + Object.keys(SurveyComponentNominalType).join(", "))
    ]
}

export const updateSurveyComponentOrderChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        check("componentId").isMongoId().withMessage("Component ID must be a valid Mongo ID"),
        body("order").isInt({ min: -1, max: 1 }).withMessage("Order must be -1 or 1")
    ]
}

export const deleteSurveyComponentChain = () => {
    return [
        check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
        check("componentId").isMongoId().withMessage("Component ID must be a valid Mongo ID")
    ]
}