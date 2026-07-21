import { Document, Model, Schema, Types, model } from "mongoose";

interface BudgetReceiptAttrs {
    positionId: Types.ObjectId;
    amount: number;
    description?: string;
    date: Date;
    file?: { title: string, link: string, mimetype: string };
    createdAt: Date;
    updatedAt: Date;
}

interface BudgetReceiptModel extends Model<BudgetReceiptDoc> {
    build: (attrs: BudgetReceiptAttrs) => BudgetReceiptDoc;
}

export interface BudgetReceiptDoc extends Document {
    positionId: Types.ObjectId;
    amount: number;
    description?: string;
    date: Date;
    file?: { title: string, link: string, mimetype: string };
    createdAt: Date;
    updatedAt: Date;
}

const BudgetReceiptSchema = new Schema({
    positionId: { type: Types.ObjectId, required: true, ref: "BudgetPosition" },
    amount: { type: Number, required: true },
    description: { type: String, required: false, default: '' },
    date: { type: Date, required: true },
    file: { type: Object, required: false, default: null },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
})

BudgetReceiptSchema.statics.build = (attrs: BudgetReceiptAttrs) => {
    return new BudgetReceipt(attrs);
}

const BudgetReceipt = model<BudgetReceiptDoc, BudgetReceiptModel>("BudgetReceipt", BudgetReceiptSchema);

export default BudgetReceipt;