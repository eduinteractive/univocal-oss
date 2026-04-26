import { Request, Response, NextFunction } from "express";
import Budget, { BudgetDoc } from "../models/Budget";
import { createSVHMetadata, createSVHMetadataAttrs, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs } from "@eduinteractive/uvc-common";
import BudgetPosition, { BudgetPositionDoc, BudgetPositionType } from "../models/BudgetPosition";
import { Types } from "mongoose";

interface getBudgetsQuery extends readSVHQuery { }

export const getBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getBudgetsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };

        const budgets = await Budget.find(condition).sort(svhFilter.sort);
        res.status(200).json(budgets);
    } catch (err) {
        next(err);
    }
}

interface createBudgetRequest extends createSVHMetadataAttrs {
    year: number;
}

export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createBudgetRequest;
        const budgetAttrs = createSVHMetadata(req, body);
        const budget = Budget.build({
            ...budgetAttrs,
            year: body.year
        });
        await budget.save();
        res.status(201).json(budget);
    } catch (err) {
        next(err);
    }
}

interface updateBudgetRequest extends updateSVHMetadataAttrs {
    year?: number;
    ist_active?: boolean;
}

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateBudgetRequest;
        const { budgetId, tenantId } = req.params as { budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        updateSVHMetadata(budget, body)
        budget.year = body.year !== undefined ? body.year : budget.year;
        budget.ist_active = body.ist_active !== undefined ? body.ist_active : budget.ist_active;
        await budget.save();
        res.status(200).json(budget);
    } catch (err) {
        next(err);
    }
}

export const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as { budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        await budget.deleteOne();
        res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export const getBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as { budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const positions = await BudgetPosition.find({ budgetId: budget._id })
        res.status(200).json({
            budget,
            positions
        });
    } catch (err) {
        next(err);
    }
}

interface getBudgetsStatisticsQuery {
    year?: string;
}

export const getBudgetsStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const query = req.query as getBudgetsStatisticsQuery;
        const condition = {  tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel }, year: query.year ? Number.parseInt(query.year) : new Date().getFullYear() };

        const budgets = await Budget.find(condition);
        const positions = await BudgetPosition.find({ budgetId: { $in: budgets.map(budget => budget._id) } });

        const result: {
            _id: string;
            title: string;
            income: number;
            expense: number;
        }[] = [];
        for (const budget of budgets) {
            const income = positions.filter(position => position.budgetId.toString() === budget._id?.toString() && position.type === BudgetPositionType.INCOME).reduce((sum, position) => sum + position.soll_amount, 0);
            const expense = positions.filter(position => position.budgetId.toString() === budget._id?.toString() && position.type === BudgetPositionType.EXPENSE).reduce((sum, position) => sum + position.soll_amount, 0);
            result.push({
                _id: budget.id,
                title: budget.title,
                income,
                expense
            });
        }

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

// Budget Position Operations

interface createBudgetPositionRequest {
    title: string;
    description?: string;
    type: BudgetPositionType;
    soll_amount: number;
    ist_amount?: number;
    parent?: string;
}

export const createBudgetPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as { budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const { title, description, type, soll_amount, ist_amount, parent } = req.body as createBudgetPositionRequest;
        const budgetPosition = BudgetPosition.build({ budgetId: new Types.ObjectId(budgetId), parent: parent ? new Types.ObjectId(parent as string) : undefined, title, description, type, soll_amount, ist_amount, createdAt: new Date(), updatedAt: new Date() });
        await budgetPosition.save();
        res.status(201).json(budgetPosition);
    } catch (err) {
        next(err);
    }
}

interface updateBudgetPositionRequest {
    title: string;
    description?: string;
    soll_amount: number;
    ist_amount?: number;
}

export const updateBudgetPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, positionId, tenantId } = req.params as { budgetId: string, positionId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const { title, description, soll_amount, ist_amount } = req.body as updateBudgetPositionRequest;
        const budgetPosition = await BudgetPosition.findById(positionId);
        if (!budgetPosition || !budgetPosition.budgetId.equals(budget._id)) {
            throw new NotFoundError("Die Budgetposition konnte nicht gefunden werden.")
        }
        budgetPosition.set({ title, description, soll_amount, ist_amount, updatedAt: new Date() });
        await budgetPosition.save();
        res.status(200).json(budgetPosition);
    } catch (err) {
        next(err);
    }
}

export const deleteBudgetPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { positionId, budgetId, tenantId } = req.params as { positionId: string, budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const budgetPosition = await BudgetPosition.findById(positionId);
        if (!budgetPosition || !budgetPosition.budgetId.equals(budget._id)) {
            throw new NotFoundError("Die Budgetposition konnte nicht gefunden werden.")
        }
        await budgetPosition.deleteOne();
        res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export const getBudgetPositions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as { budgetId: string, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const budgetPositions = await BudgetPosition.find({ budgetId });
        res.status(200).json(budgetPositions);
    } catch (err) {
        next(err);
    }
}