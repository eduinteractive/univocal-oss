import { Request, Response, NextFunction } from "express";
import Budget, { BudgetDoc } from "../models/Budget";
import { BadRequestError, createSVHMetadata, createSVHMetadataAttrs, deleteFile, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs, uploadFile } from "@eduinteractive/uvc-common";
import BudgetPosition, { BudgetPositionDoc, BudgetPositionType } from "../models/BudgetPosition";
import { Types } from "mongoose";
import BudgetReceipt from "../models/BudgetReceipt";

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
    category?: string;
}

export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createBudgetRequest;
        const budgetAttrs = createSVHMetadata(req, body);
        const budget = Budget.build({
            ...budgetAttrs,
            category: body.category?.trim() || undefined
        });
        await budget.save();
        res.status(201).json(budget);
    } catch (err) {
        next(err);
    }
}

interface updateBudgetRequest extends updateSVHMetadataAttrs {
    category?: string;
    ist_active?: boolean;
    receipt_active?: boolean;
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
        const positions = await BudgetPosition.find({ budgetId: budget._id });
        const receipts = await BudgetReceipt.find({ positionId: { $in: positions.map(position => position._id) } });
        budget.category = body.category !== undefined ? (body.category.trim() || undefined) : budget.category;
        budget.ist_active = body.ist_active !== undefined ? body.ist_active : budget.ist_active;
        budget.receipt_active = body.receipt_active !== undefined ? body.receipt_active : budget.receipt_active;
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
        const positions = await BudgetPosition.find({ budgetId: budget._id });
        const receipts = await BudgetReceipt.find({ positionId: { $in: positions.map(position => position._id) } });
        for (const receipt of receipts) {
            if (receipt.file) {
                await deleteFile(receipt.file.link);
            }
            await receipt.deleteOne();
        }
        for (const position of positions) {
            await position.deleteOne();
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
    category?: string;
}

const roundMoney = (value: number) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const getBudgetCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const categories = await Budget.distinct("category", {
            tenantId: new Types.ObjectId(tenantId),
            viewAccess: { $lte: req.currentGroup!.permissionLevel },
            category: { $type: "string", $ne: "" },
        });
        res.status(200).json(
            (categories as string[])
                .filter((category) => !!category)
                .sort((a, b) => a.localeCompare(b, "de"))
        );
    } catch (err) {
        next(err);
    }
}

export const getBudgetsStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const query = req.query as getBudgetsStatisticsQuery;
        const condition: Record<string, unknown> = {
            tenantId: new Types.ObjectId(tenantId),
            viewAccess: { $lte: req.currentGroup!.permissionLevel },
        };
        if (query.category) {
            condition.category = query.category;
        } else {
            res.status(200).json([]);
            return;
        }

        const budgets = await Budget.find(condition);
        const positions = await BudgetPosition.find({ budgetId: { $in: budgets.map(budget => budget._id) } });
        const receipts = await BudgetReceipt.find({
            positionId: { $in: positions.map((position) => position._id) },
        });

        const result: {
            _id: string;
            title: string;
            income_soll: number;
            expense_soll: number;
            income_ist: number;
            expense_ist: number;
        }[] = [];

        for (const budget of budgets) {
            const budgetPositions = positions.filter(
                (position) => position.budgetId.toString() === budget._id?.toString()
            );
            const incomePositions = budgetPositions.filter(
                (position) =>
                    position.type === BudgetPositionType.INCOME && position.parent
            );
            const expensePositions = budgetPositions.filter(
                (position) =>
                    position.type === BudgetPositionType.EXPENSE && position.parent
            );

            const income_soll = roundMoney(
                incomePositions.reduce(
                    (sum, position) => sum + (position.soll_amount || 0),
                    0
                )
            );
            const expense_soll = roundMoney(
                expensePositions.reduce(
                    (sum, position) => sum + (position.soll_amount || 0),
                    0
                )
            );

            let income_ist = 0;
            let expense_ist = 0;

            if (budget.ist_active) {
                if (budget.receipt_active) {
                    const incomePositionIds = new Set(
                        incomePositions.map((position) => position._id.toString())
                    );
                    const expensePositionIds = new Set(
                        expensePositions.map((position) => position._id.toString())
                    );
                    for (const receipt of receipts) {
                        const positionId = receipt.positionId.toString();
                        if (incomePositionIds.has(positionId)) {
                            income_ist = roundMoney(income_ist + receipt.amount);
                        } else if (expensePositionIds.has(positionId)) {
                            expense_ist = roundMoney(expense_ist + receipt.amount);
                        }
                    }
                } else {
                    income_ist = roundMoney(
                        incomePositions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        )
                    );
                    expense_ist = roundMoney(
                        expensePositions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        )
                    );
                }
            }

            result.push({
                _id: budget.id,
                title: budget.title,
                income_soll,
                expense_soll,
                income_ist,
                expense_ist,
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
        const budgetPosition = BudgetPosition.build({
            budgetId: new Types.ObjectId(budgetId),
            parent: parent ? new Types.ObjectId(parent as string) : undefined,
            title,
            description,
            type,
            soll_amount: roundMoney(soll_amount || 0),
            ist_amount: roundMoney(ist_amount || 0),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
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
        budgetPosition.set({
            title,
            description,
            soll_amount: roundMoney(soll_amount || 0),
            ist_amount: roundMoney(ist_amount || 0),
            updatedAt: new Date(),
        });
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

        const isGroup =
            budgetPosition.type === BudgetPositionType.GROUP_INCOME ||
            budgetPosition.type === BudgetPositionType.GROUP_EXPENSE;

        const positionIds = [budgetPosition._id];
        if (isGroup) {
            const childPositions = await BudgetPosition.find({
                parent: budgetPosition._id,
                budgetId: budget._id,
            });
            positionIds.push(...childPositions.map((position) => position._id));
        }

        const budgetReceipts = await BudgetReceipt.find({
            positionId: { $in: positionIds },
        });
        if (budgetReceipts.length > 0) {
            throw new BadRequestError("Die Budgetposition kann nicht gelöscht werden, da sie Belegen zugeordnet ist. Lösche zuerst die Belege.")
        }
        await BudgetPosition.deleteMany({ _id: { $in: positionIds } });
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

// Budget Receipt Operations

interface createBudgetReceiptRequest {
    positionId?: Types.ObjectId;
    amount: number;
    description?: string;
    date: Date;
    file?: { title: string, link: string, mimetype: string };
}

export const createBudgetReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as unknown as { budgetId: Types.ObjectId, tenantId: string };
        const body = req.body as createBudgetReceiptRequest;

        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        if (!budget.receipt_active || !budget.ist_active) {
            throw new BadRequestError("In diesem Budget können keine Belege erfasst werden.")
        }
        if (body.positionId) {
            const position = await BudgetPosition.findById(body.positionId);
            if (!position || !position.budgetId.equals(budget._id)) {
                throw new NotFoundError("Die Budgetposition konnte nicht gefunden werden.")
            }
            if (!position.parent) {
                throw new BadRequestError("Ein Beleg kann keiner Gruppe zugeordnet werden.")
            }
        }
        let newPositionId = body.positionId;
        if (!body.positionId) {
            const positionWithoutAssignment = await BudgetPosition.findOne({ budgetId, without_assignment: true, parent: { $ne: null } });
            if (!positionWithoutAssignment) {
                // create new position without assignment
                const position = BudgetPosition.build({
                    budgetId,
                    title: "Nicht zugeordnet",
                    description: "Nicht zugeordnet",
                    type: BudgetPositionType.GROUP_EXPENSE,
                    soll_amount: 0,
                    ist_amount: 0,
                    without_assignment: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // create child position for amount
                const childPosition = BudgetPosition.build({
                    budgetId,
                    parent: position._id,
                    title: "Betrag",
                    description: "Betrag",
                    type: BudgetPositionType.EXPENSE,
                    soll_amount: 0,
                    ist_amount: 0,
                    without_assignment: true, 
                    createdAt: new Date(), 
                    updatedAt: new Date()
                });
                await position.save();
                await childPosition.save();
                newPositionId = childPosition._id;
            } else {
                newPositionId = positionWithoutAssignment._id;
            }
        }

        const budgetReceipt = BudgetReceipt.build({ 
            positionId: newPositionId as Types.ObjectId, 
            amount: roundMoney(body.amount), 
            description: body.description, 
            date: body.date, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        });

        let newFile = body.file;
        if (req.file) {
            const extension = req.file.originalname.split('.').pop();
            const location = await uploadFile(tenantId + "/" + budget._id + "/receipts/" + budgetReceipt._id + "." + extension, req.file)
            newFile = {
                title: req.file.originalname,
                link: location,
                mimetype: req.file.mimetype
            }
        }
        
        budgetReceipt.file = newFile;
        await budgetReceipt.save();
        res.status(201).json(budgetReceipt);
    } catch (err) {
        next(err);
    }
}

interface updateBudgetReceiptRequest {
    positionId: Types.ObjectId;
    amount: number;
    description?: string;
    date: Date;
    file?: { title: string, link: string, mimetype: string };
}

export const updateBudgetReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, receiptId, tenantId } = req.params as unknown as { budgetId: Types.ObjectId, receiptId: Types.ObjectId, tenantId: string };
        const body = req.body as updateBudgetReceiptRequest;
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const budgetReceipt = await BudgetReceipt.findById(receiptId);
        if (!budgetReceipt) {
            throw new NotFoundError("Der Beleg konnte nicht gefunden werden.")
        }

        const budgetPosition = await BudgetPosition.findById(body.positionId);
        if (!budgetPosition || !budgetPosition.budgetId.equals(budget._id)) {
            throw new NotFoundError("Die Budgetposition konnte nicht gefunden werden.")
        }
        if (!budgetPosition.parent) {
            throw new BadRequestError("Ein Beleg kann keiner Gruppe zugeordnet werden.")
        }

        if (!body.file && budgetReceipt.file) {
            await deleteFile(budgetReceipt.file.link);
        }

        budgetReceipt.set({ 
            positionId: body.positionId !== undefined ? body.positionId : budgetReceipt.positionId, 
            amount: body.amount !== undefined ? roundMoney(body.amount) : budgetReceipt.amount, 
            description: body.description !== undefined ? body.description : budgetReceipt.description, 
            date: body.date !== undefined ? body.date : budgetReceipt.date, 
            file: body.file, 
            updatedAt: new Date() 
        });

        await budgetReceipt.save();
        
        if (req.file) {
            const extension = req.file.originalname.split('.').pop();
            const location = await uploadFile(tenantId + "/" + budget._id + "/receipts/" + budgetReceipt._id + "." + extension, req.file)
            budgetReceipt.file = {
                title: req.file.originalname,
                link: location,
                mimetype: req.file.mimetype,
            }
        }

        await budgetReceipt.save();
        res.status(200).json(budgetReceipt);
    } catch (err) {
        console.debug(err);
        next(err);
    }
}

export const deleteBudgetReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { receiptId, budgetId, tenantId } = req.params as unknown as { receiptId: Types.ObjectId, budgetId: Types.ObjectId, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const budgetReceipt = await BudgetReceipt.findById(receiptId);
        const budgetPosition = await BudgetPosition.findById(budgetReceipt?.positionId);
        if (!budgetReceipt || !budgetPosition || !budgetPosition.budgetId.equals(budget._id)) {
            throw new NotFoundError("Der Beleg konnte nicht gefunden werden.")
        }
        if (budgetReceipt.file) {
            await deleteFile(budgetReceipt.file.link);
        }
        await budgetReceipt.deleteOne();
        res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export const getBudgetReceipts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId, tenantId } = req.params as unknown as { budgetId: Types.ObjectId, tenantId: string };
        const budget = await Budget.findById(budgetId) as BudgetDoc;
        if (!hasReadPermission(budget, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Budget konnte nicht gefunden werden.")
        }
        const positions = await BudgetPosition.find({ budgetId });
        const budgetReceipts = await BudgetReceipt.find({ positionId: { $in: positions.map(position => position._id) } });
        res.status(200).json(budgetReceipts);
    } catch (err) {
        next(err);
    }
}