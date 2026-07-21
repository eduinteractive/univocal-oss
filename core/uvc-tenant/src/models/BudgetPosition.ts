import { Document, Model, Schema, Types, model } from "mongoose";

export enum BudgetPositionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    GROUP_INCOME = 'GROUP_INCOME',
    GROUP_EXPENSE = 'GROUP_EXPENSE',
}

interface BudgetPositionAttrs {
    budgetId: Types.ObjectId;
    next?: Types.ObjectId;
    parent?: Types.ObjectId;
    title: string;
    description?: string;
    type: BudgetPositionType;
    soll_amount: number;
    ist_amount?: number;
    without_assignment?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface BudgetPositionModel extends Model<BudgetPositionDoc> {
    build: (attrs: BudgetPositionAttrs) => BudgetPositionDoc;
}

export interface BudgetPositionDoc extends Document {
    budgetId: Types.ObjectId;
    next?: Types.ObjectId;
    parent?: Types.ObjectId;
    title: string;
    description?: string;
    type: BudgetPositionType;
    soll_amount: number;
    ist_amount?: number;
    without_assignment?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BudgetPositionSchema = new Schema({
    budgetId: { type: Types.ObjectId, required: true, ref: "Budget" },
    next: { type: Types.ObjectId, required: false, ref: "BudgetPosition" },
    parent: { type: Types.ObjectId, required: false, ref: "BudgetPosition" },
    title: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    type: { type: String, required: true },
    soll_amount: { type: Number, required: true },
    ist_amount: { type: Number, required: false, default: 0 },
    without_assignment: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
})

BudgetPositionSchema.statics.build = (attrs: BudgetPositionAttrs) => {
    return new BudgetPosition(attrs);
}

const BudgetPosition = model<BudgetPositionDoc, BudgetPositionModel>("BudgetPosition", BudgetPositionSchema);

export default BudgetPosition;