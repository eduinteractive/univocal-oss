import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Document, Model, Schema, Types, model } from "mongoose";

interface BudgetAttrs extends SVHMetadataAttrs {
    year?: number;
    ist_active?: boolean;
}

interface BudgetModel extends Model<BudgetDoc> {
    build: (attrs: BudgetAttrs) => BudgetDoc;
}

export interface BudgetDoc extends SVHMetadataDoc {
    _id: Types.ObjectId;
    year?: number;
    ist_active?: boolean;
}

const BudgetSchema = new Schema({
    year: { type: Number, required: false },
    ist_active: { type: Boolean, required: false, default: false },
})

BudgetSchema.add(SVHMetadataSchema)

BudgetSchema.statics.build = (attrs: BudgetAttrs) => {
    return new Budget(attrs);
}

const Budget = model<BudgetDoc, BudgetModel>("Budget", BudgetSchema);

export default Budget;