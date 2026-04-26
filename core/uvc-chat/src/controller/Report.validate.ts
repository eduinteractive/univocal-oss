import { body, check } from "express-validator"
import { ReportAction } from "../models/Report"

export const readReportChain  = () => {
    return [
        check("reportId").isMongoId().withMessage("Report ID must be a valid Mongo ID"),
    ]
}

export const updateReportChain = () => {
    return [
        body("action").isIn(Object.values(ReportAction)).optional({ values: "falsy" }),
        body("reason").isString().optional(),
    ]
}