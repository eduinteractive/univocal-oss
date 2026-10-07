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
        body("options.isActive").optional().isBoolean().withMessage("Is active must be a boolean"),
        body("options.startDate").optional({ values: "null" }).isISO8601().toDate().withMessage("Startzeit muss ein gültiges Datum sein"),
        body("options.endDate").optional({ values: "null" }).isISO8601().toDate().withMessage("Endzeit muss ein gültiges Datum sein"),
        body("options.redirectionUrl").optional({ values: "falsy" }).isURL({ require_protocol: false }).withMessage("Weiterleitung muss eine gültige Adresse sein"),
        body("options.resultsSharing").optional().isBoolean().withMessage("Ergebnis-Freigabe muss ein Boolean sein"),
        body("options.showQuestionNumbers").optional().isBoolean().withMessage("Fragennummerierung muss ein Boolean sein"),
        body("options").optional().custom((options) => {
            if (options?.startDate && options?.endDate && new Date(options.startDate) > new Date(options.endDate)) {
                throw new Error("Die Startzeit muss vor der Endzeit liegen.");
            }
            return true;
        }),
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