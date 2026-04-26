import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '@eduinteractive/uvc-common';
import Budget from '../models/Budget';

export const isBudgetAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params as { budgetId: string };
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new NotFoundError("Umfrage nicht gefunden!");
        }

        if (!req.permission && !budget.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }

        next();
    } catch (err) {
        next(err)
    }
}