import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { NotFoundError } from "@eduinteractive/uvc-common";
import SurveyMeta from "../models/SurveyMeta";
import SurveyComponent, { SurveyComponentType } from "../models/SurveyComponent";
import SurveyResult from "../models/SurveyResult";

const COUNTABLE_TYPES = [SurveyComponentType.CHOICE, SurveyComponentType.LIKERT, SurveyComponentType.NOMINAL];

export const getTenantSurveys = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const ids = String(req.query.ids ?? "")
            .split(",")
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));
        if (ids.length === 0) {
            res.status(200).json([]);
            return;
        }

        const surveys = await SurveyMeta.find({ _id: { $in: ids }, tenantId: new Types.ObjectId(tenantId) });
        const components = await SurveyComponent.find({ surveyId: { $in: surveys.map((survey) => survey._id) } });
        const responseCounts = await SurveyResult.aggregate<{ _id: Types.ObjectId; count: number }>([
            { $match: { surveyId: { $in: surveys.map((survey) => survey._id) } } },
            { $group: { _id: "$surveyId", count: { $sum: 1 } } },
        ]);

        res.status(200).json(surveys.map((survey) => ({
            survey: {
                _id: survey._id,
                title: survey.title,
                description: survey.description,
                options: {
                    executionMode: survey.options.executionMode,
                    isActive: survey.options.isActive,
                },
            },
            components: components.filter((component) => component.surveyId.equals(survey._id as Types.ObjectId)),
            responses: responseCounts.find((count) => count._id.equals(survey._id as Types.ObjectId))?.count ?? 0,
        })));
    } catch (err) {
        next(err);
    }
}

export const getTenantSurveyResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, surveyId } = req.params as { tenantId: string, surveyId: string };
        const survey = await SurveyMeta.findOne({ _id: new Types.ObjectId(surveyId), tenantId: new Types.ObjectId(tenantId) });
        if (!survey) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }

        const components = await SurveyComponent.find({ surveyId: survey._id, type: { $in: COUNTABLE_TYPES } });
        const componentIds = components.map((component) => component._id.toString());

        const total = await SurveyResult.countDocuments({ surveyId: survey._id });
        const counts = await SurveyResult.aggregate<{ _id: { key: string; value: unknown }; count: number }>([
            { $match: { surveyId: survey._id } },
            { $unwind: "$answers" },
            { $match: { "answers.key": { $in: componentIds } } },
            { $unwind: "$answers.value" },
            { $group: { _id: { key: "$answers.key", value: "$answers.value" }, count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            surveyId: survey._id,
            total,
            components: components.map((component) => {
                const optionCounts: Record<string, number> = {};
                counts
                    .filter((entry) => entry._id.key === component._id.toString() && typeof entry._id.value === "number")
                    .forEach((entry) => {
                        optionCounts[String(entry._id.value)] = entry.count;
                    });
                return {
                    componentId: component._id,
                    type: component.type,
                    counts: optionCounts,
                };
            }),
        });
    } catch (err) {
        next(err);
    }
}
