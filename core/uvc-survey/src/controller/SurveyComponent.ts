import { Request, Response, NextFunction } from "express";
import SurveyComponent, { SurveyComponentNominalType, SurveyComponentType } from "../models/SurveyComponent";
import mongoose, { Types } from "mongoose";
import { BadRequestError, hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";
import { createSurveyComponentFactory, updateSurveyComponentFactory } from "../models/SurveyComponentFactory";
import { validateLinkedList } from "../helper/LinkedList";
import SurveyMeta, { SurveyMetaDoc } from "../models/SurveyMeta";

interface createSurveyComponentRequest {
    title: string;
    required?: boolean;
    type: SurveyComponentType;
    previous?: string;
    // Component Specific
    description?: string;
    scale?: {
        labels: string[];
    }
    choices?: string[];
    multiple?: boolean;
    max?: number;
    nominalType?: SurveyComponentNominalType;
}

export const createSurveyComponent = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { surveyId, tenantId } = req.params as { surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId).session(session) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const body = req.body as createSurveyComponentRequest;
        const componentBody = {
            ...body,
            surveyId: new Types.ObjectId(surveyId),
            previous: undefined,
        }

        const newSurveyComponent = createSurveyComponentFactory(componentBody);

        if (!body.previous) {
            const lastComponent = await SurveyComponent.findOne({ surveyId: new Types.ObjectId(surveyId), next: null }).session(session);
            if (lastComponent) {
                newSurveyComponent.previous = lastComponent._id;
                lastComponent.next = newSurveyComponent._id;
                await lastComponent.save({ session });
            }
        } else {
            const previousComponent = await SurveyComponent.findById(body.previous).session(session);
            if (!previousComponent) {
                throw new NotFoundError('Vorgänger-Komponente nicht gefunden');
            }

            const nextComponent = await SurveyComponent.findById(previousComponent.next).session(session);
            if (nextComponent) {
                nextComponent.previous = newSurveyComponent._id;
                await nextComponent.save({ session });
            }

            newSurveyComponent.previous = previousComponent._id;
            newSurveyComponent.next = previousComponent.next;
            previousComponent.next = newSurveyComponent._id;
            await previousComponent.save({ session });
        }

        await newSurveyComponent.save({ session });
        await validateLinkedList(SurveyComponent, { surveyId: new Types.ObjectId(surveyId) }, session);
        await session.commitTransaction();
        res.status(201).json(newSurveyComponent);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

export interface updateSurveyComponentRequest {
    type: SurveyComponentType;
    title?: string;
    rqeuired?: boolean;
    // Component Specific
    description?: string;
    scale?: {
        steps: number;
        labels: string[];
    }
    choices?: string[];
    multiple?: boolean;
    max?: number;
    nominalType?: SurveyComponentNominalType;
}

export const updateSurveyComponent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { componentId, surveyId, tenantId } = req.params as { componentId: string, surveyId: string, tenantId: string };
        const body = req.body as updateSurveyComponentRequest;
        const survey = await SurveyMeta.findById(surveyId) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const surveyComponent = await SurveyComponent.findById(componentId);
        if (!surveyComponent || !surveyComponent.surveyId.equals(survey._id as Types.ObjectId)) {
            throw new NotFoundError("Die Komponente wurde nicht gefunden.");
        }
        const updatedSurveyComponent = await updateSurveyComponentFactory(componentId, body);
        res.status(200).json(updatedSurveyComponent);
    } catch (err) {
        next(err);
    }
}

interface updateSurveyComponentOrderRequest {
    order: -1 | 1;
}

export const updateSurveyComponentOrder = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { componentId, surveyId, tenantId } = req.params as { componentId: string, surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId).session(session) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const { order } = req.body as updateSurveyComponentOrderRequest;

        // Finden der aktuellen Komponente
        const currentComponent = await SurveyComponent.findById(componentId).session(session);
        if (!currentComponent || !currentComponent.surveyId.equals(survey._id as Types.ObjectId)) {
            throw new NotFoundError('Komponente nicht gefunden');
        }

        // Finden der benachbarten Komponenten
        const nextComponent = await SurveyComponent.findById(currentComponent.next).session(session);
        const previousComponent = await SurveyComponent.findById(currentComponent.previous).session(session);

        if (order === 1 && !previousComponent) {
            throw new BadRequestError('Das ist bereits die erste Komponente, kann nicht weiter nach oben verschoben werden.');
        }
        if (order === -1 && !nextComponent) {
            throw new BadRequestError('Das ist bereits die letzte Komponente, kann nicht weiter nach unten verschoben werden.');
        }

        if (order === 1 && previousComponent) {
            // Verschieben nach oben in der Kette
            const previousPreviousComponent = await SurveyComponent.findById(previousComponent.previous).session(session);
            if (previousPreviousComponent) {
                previousPreviousComponent.next = currentComponent._id;
                await previousPreviousComponent.save({ session: session });
            }

            currentComponent.previous = previousComponent.previous;
            currentComponent.next = previousComponent._id;
            previousComponent.previous = currentComponent._id;

            if (nextComponent) {
                previousComponent.next = nextComponent._id;
                nextComponent.previous = previousComponent._id;
                await nextComponent.save({ session });
            } else {
                previousComponent.next = undefined;
            }
            await previousComponent.save({ session });
        } else if (order === -1 && nextComponent) {
            // Verschieben nach unten in der Kette
            const nextNextComponent = await SurveyComponent.findById(nextComponent.next).session(session);
            if (nextNextComponent) {
                nextNextComponent.previous = currentComponent._id;
                await nextNextComponent.save({ session: session });
            }

            if (previousComponent) {
                previousComponent.next = nextComponent._id;
                await previousComponent.save({ session: session });
            }

            currentComponent.next = nextComponent.next;
            currentComponent.previous = nextComponent._id;
            nextComponent.next = currentComponent._id;
            nextComponent.previous = previousComponent ? previousComponent._id : undefined;
        }

        // Speichern der Änderungen
        await currentComponent.save({ session: session });
        if (nextComponent) {
            await nextComponent.save({ session: session });
        }
        if (previousComponent) {
            await previousComponent.save({ session: session });
        }
        await validateLinkedList(SurveyComponent, { surveyId: currentComponent.surveyId }, session);
        await session.commitTransaction();
        res.status(200).json(currentComponent);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}

export const deleteSurveyComponent = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { componentId, surveyId, tenantId } = req.params as { componentId: string, surveyId: string, tenantId: string };
        const survey = await SurveyMeta.findById(surveyId).session(session) as SurveyMetaDoc;
        if (!hasReadPermission(survey, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Die Umfrage wurde nicht gefunden.");
        }
        const surveyComponent = await SurveyComponent.findById(componentId).session(session);
        if (!surveyComponent || !surveyComponent.surveyId.equals(survey._id as Types.ObjectId)) {
            throw new NotFoundError('Komponente nicht gefunden');
        }

        const nextComponent = await SurveyComponent.findOne({ _id: surveyComponent.next }).session(session);
        const previousComponent = await SurveyComponent.findOne({ _id: surveyComponent.previous }).session(session);
        if (nextComponent) {
            nextComponent.previous = surveyComponent.previous ? surveyComponent.previous : undefined;
            await nextComponent.save({ session: session });
        }
        if (previousComponent) {
            previousComponent.next = surveyComponent.next ? surveyComponent.next : undefined;
            await previousComponent.save({ session: session });
        }
        await surveyComponent.deleteOne({ session });
        await validateLinkedList(SurveyComponent, { surveyId: surveyComponent.surveyId }, session);
        await session.commitTransaction();
        res.status(200).json("Die Komponente wurde erfolgreich gelöscht.");
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
}