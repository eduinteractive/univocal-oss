import { Request, Response, NextFunction } from "express";
import SurveyMeta, { SurveyMetaDoc } from "../models/SurveyMeta";
import { hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";
import SurveyComponent from "../models/SurveyComponent";
import SurveyResult from "../models/SurveyResult";
import { Types } from "mongoose";

export const getSurveyResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const components = await SurveyComponent.find({ surveyId: survey._id });
        const results = await SurveyResult.find({ surveyId: survey._id });
        const mappedResults = results.map(result => {
            return {
                ...result.toObject(),
                answers: result.answers.reduce((acc: Record<string, any>, answer) => {
                    acc[answer.key] = answer.value;  // Transform the array of answers into an object
                    return acc;
                }, {})
            }
        })
        res.status(200).json({ survey, components, results: mappedResults });
    } catch (err) {
        next(err);
    }
}

export const deleteSurveyResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { resultId, surveyId, tenantId } = req.params as { resultId: string, surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const result = await SurveyResult.findByIdAndDelete(resultId);
        if (!result || !result.surveyId.equals(survey._id as Types.ObjectId)) {
            throw new NotFoundError("Das Ergebnis wurde nicht gefunden.");
        }
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const deleteSurveyResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const results = await SurveyResult.deleteMany({ surveyId });
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
}