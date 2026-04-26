import { Request, Response, NextFunction } from 'express';
import SurveyMeta from '../models/SurveyMeta';
import { ForbiddenError, NotFoundError } from '@eduinteractive/uvc-common';

export const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { surveyId } = req.params as { surveyId: string };
        const surveyMeta = await SurveyMeta.findById(surveyId);
        if (!surveyMeta) {
            throw new NotFoundError("Umfrage nicht gefunden!");
        }

        if (!req.permission && !surveyMeta.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }

        next();
    } catch (err) {
        next(err)
    }
}