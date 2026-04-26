import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"
import { BudgetPositionType } from "../models/BudgetPosition"

export const createBudgetChain = () => {
    return [
        ...createSVHMetadataChain(),
        body("year").optional().isInt().withMessage("year must be an integer")
    ]
}

export const getBudgetChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID")
    ]
}

export const updateBudgetChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID"),
        body("year").optional().isInt().withMessage("year must be an integer"),
        body("ist_active").optional().isBoolean().withMessage("ist_active must be a boolean")
    ]
}

export const deleteBudgetChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID")
    ]
}

export const createBudgetPositionChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID"),
        body("title").isString().withMessage("title must be a string"),
        body("description").optional().isString().withMessage("description must be a string"),
        body("type").isIn(Object.keys(BudgetPositionType)).withMessage("type must be a valid BudgetPositionType"),
        body("soll_amount").isFloat({ min: 0 }).withMessage("soll_amount must be a number"),
        body("ist_amount").optional().isFloat({ min: 0 }).withMessage("ist_amount must be a number"),
        body("parent").optional().isString().withMessage("parent must be a valid Mongo ID")
    ]
}

export const getBudgetPositionsChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID"),
    ]
}

export const updateBudgetPositionChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID"),
        check("positionId").isMongoId().withMessage("positionId must be a valid Mongo ID"),
        body("title").optional().isString().withMessage("title must be a string"),
        body("description").optional().isString().withMessage("description must be a string"),
        body("soll_amount").optional().isFloat({ min: 0 }).withMessage("soll_amount must be a number"),
        body("ist_amount").optional().isFloat({ min: 0 }).withMessage("ist_amount must be a number"),
    ]
}

export const deleteBudgetPositionChain = () => {
    return [
        check("budgetId").isMongoId().withMessage("budgetId must be a valid Mongo ID"),
        check("positionId").isMongoId().withMessage("positionId must be a valid Mongo ID")
    ]
}