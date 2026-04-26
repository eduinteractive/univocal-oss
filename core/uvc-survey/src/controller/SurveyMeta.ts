import { Request, Response, NextFunction } from "express";
import SurveyMeta, { EXECUTION_MODE, SurveyMetaDoc } from "../models/SurveyMeta";
import { Types } from "mongoose";
import { BadRequestError, createSVHMetadata, createSVHMetadataAttrs, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs } from "@eduinteractive/uvc-common";
import SurveyComponent from "../models/SurveyComponent";
import SurveyResult from "../models/SurveyResult";

interface getSurveysQuery extends readSVHQuery {}

export const getSurveys = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getSurveysQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };

        const surveys = await SurveyMeta.find(condition).sort(svhFilter.sort);
        res.status(200).json(surveys);
    } catch (err) {
        next(err);
    }
}

export const getSurvey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const components = await SurveyComponent.find({ surveyId: new Types.ObjectId(surveyId) });
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
        res.status(200).json({
            survey,
            components,
            results: mappedResults,
        });
    } catch (err) {
        next(err);
    }
}

interface createSurveyRequest extends createSVHMetadataAttrs {
    options: {
        executionMode: EXECUTION_MODE;
    }
}

export const createSurvey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createSurveyRequest;
        const surveyAttrs = createSVHMetadata(req, body);
        const survey = SurveyMeta.build({
            ...surveyAttrs,
            options: {
                executionMode: body.options.executionMode,
                isActive: false
            }
        });
        await survey.save();
        res.status(201).json(survey);
    } catch (err) {
        next(err);
    }
}

interface updateSurveyRequest extends updateSVHMetadataAttrs {
    options?: {
        executionMode?: EXECUTION_MODE;
        isActive?: boolean;
    }
}

export const updateSurvey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const body = req.body as updateSurveyRequest;
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        updateSVHMetadata(survey, body);
        survey.options.executionMode = body.options?.executionMode !== undefined ? body.options.executionMode : survey.options.executionMode;
        survey.options.isActive = body.options?.isActive !== undefined ? body.options.isActive : survey.options.isActive;
        await survey.save();
        res.status(200).json(survey);
    } catch (err) {
        next(err);
    }
}

export const deleteSurvey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        await survey.deleteOne();
        await SurveyComponent.deleteMany({ surveyId: new Types.ObjectId(surveyId) });
        await SurveyResult.deleteMany({ surveyId: new Types.ObjectId(surveyId) });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

interface generateSurveyCodesRequest {
    amount: number;
}

export const generateSurveyCodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const body = req.body as generateSurveyCodesRequest;
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        if (survey.options.executionMode !== EXECUTION_MODE.TAN) {
            throw new BadRequestError("Die Umfrage verwendet keine Umfragecodes");
        }
        const codes = [];
        for (let i = 0; i < body.amount; i++) {
            const code = Math.random().toString(36).substring(2, 8);
            codes.push({
                code,
                isUsed: false
            });
        }
        survey.options.tans = survey.options.tans?.concat(codes) || codes;
        await survey.save();
        res.status(200).json(survey);
    } catch (err) {
        next(err);
    }
}

export const resetSurveyCodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        if (survey.options.executionMode !== EXECUTION_MODE.TAN) {
            throw new Error("Die Umfrage verwendet keine Umfragecodes");
        }
        survey.options.tans = [];
        await survey.save();
        res.status(200).json(survey);
    } catch (err) {
        next(err);
    }
}

export const resetSurveysACL = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const surveys = await SurveyMeta.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const survey of surveys) {
            survey.authorId = new Types.ObjectId();
            await survey.save();
        }
        res.status(200).send("Success");
    } catch (err) {
        next(err);
    }
}