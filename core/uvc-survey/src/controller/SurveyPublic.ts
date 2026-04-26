import { Request, Response, NextFunction } from "express";
import SurveyMeta, { EXECUTION_MODE } from "../models/SurveyMeta";
import SurveyComponent from "../models/SurveyComponent";
import { BadRequestError, ForbiddenError, NotFoundError } from "@eduinteractive/uvc-common";
import mongoose, { Types } from "mongoose";
import SurveyResult from "../models/SurveyResult";
import { getOrCreateVisitorId } from "../utils/cookieUtils";

export const getSurvey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId } = req.params as { surveyId: string };
        const survey = await SurveyMeta.findById(surveyId);
        if (!survey) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        if (!survey.options.isActive) {
            throw new ForbiddenError("Die Umfrage ist nicht aktiv.");
        }

        let identifier: string | undefined;
        if (survey.options.executionMode === EXECUTION_MODE.ANONYMOUS) {
            identifier = getOrCreateVisitorId(req, res);
            
            const isExisting = await SurveyResult.exists({
                surveyId: new Types.ObjectId(surveyId), // Nur für diese spezifische Umfrage
                "personal.identifier": identifier
            });
            if (isExisting) {
                throw new ForbiddenError("Sie haben bereits an dieser Umfrage teilgenommen.");
            }
        } else {
            // Für andere Modi: Verwende identifier aus Query-Parameter (falls vorhanden)
            identifier = req.query.identifier as string | undefined;
        }

        const components = await SurveyComponent.find({ surveyId: new Types.ObjectId(surveyId) });
        res.status(200).json({
            survey: {
                _id: survey._id,
                title: survey.title,
                description: survey.description,
                options: {
                    executionMode: survey.options.executionMode,
                    isActive: survey.options.isActive
                },
            },
            components
        });
    } catch (err) {
        next(err);
    }
}

interface createSurveyResultRequest {
    personal: {
        identifier?: string;
    },
    answers: {
        [key: string]: any;
    }
}

export const createSurveyResult = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const body = req.body as createSurveyResultRequest;

        const surveyMeta = await SurveyMeta.findById(surveyId).session(session);

        if (!surveyMeta) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }

        if (!surveyMeta.options.isActive) {
            throw new ForbiddenError("Die Umfrage ist nicht aktiv.");
        }

        if (surveyMeta.options.executionMode === EXECUTION_MODE.ANONYMOUS) {
            // Für anonyme Umfragen: Verwende Cookie-basierte Visitor-ID
            // Die Visitor-ID ist global (gleiche ID für alle Umfragen), aber die Prüfung erfolgt nur für diese spezifische Umfrage
            const identifier = getOrCreateVisitorId(req, res);
            if (identifier) {
                // Prüfe, ob bereits eine Teilnahme an DIESER spezifischen Umfrage mit diesem Identifier existiert
                // Wichtig: Die Prüfung erfolgt nur für diese surveyId, nicht global
                // Dadurch kann der Benutzer an mehreren verschiedenen Umfragen teilnehmen
                const isExisting = await SurveyResult.exists({
                    surveyId: new Types.ObjectId(surveyId), // Nur für diese spezifische Umfrage
                    "personal.identifier": identifier
                }).session(session);
                if (isExisting) {
                    throw new ForbiddenError("Sie haben bereits an dieser Umfrage teilgenommen.");
                }
                // Überschreibe body.personal.identifier mit der Cookie-basierten ID
                body.personal.identifier = identifier;
            }
        } else if (surveyMeta.options.executionMode === EXECUTION_MODE.DEFAULT) {
            body.personal.identifier = undefined;
        } else if (surveyMeta.options.executionMode === EXECUTION_MODE.TAN) {
            if (!body.personal.identifier) {
                throw new BadRequestError("TAN ist erforderlich.");
            }
            const tan = surveyMeta.options.tans?.find(tan => tan.code === body.personal.identifier);
            if (!tan || tan.isUsed) {
                throw new BadRequestError("Ungültiger Umfragecode.");
            }
            tan.isUsed = true;
            await surveyMeta.save({ session });
        }

        if (!body.answers || Object.keys(body.answers).length === 0) {
            throw new BadRequestError("Antworten sind erforderlich.");
        }

        const surveyResult = SurveyResult.build({
            surveyId: new Types.ObjectId(surveyId),
            personal: {
                identifier: body.personal.identifier ? body.personal.identifier : undefined
            },
            answers: Object.entries(body.answers).map(([key, value]) => {
                return { key, value };
            })
        });

        await surveyResult.save({ session });
        await session.commitTransaction();
        res.status(201).json("Ergebnis erfolgreich gespeichert.");
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}