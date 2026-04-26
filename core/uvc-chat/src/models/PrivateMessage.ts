import { Document, Model, Schema, Types, model } from "mongoose";

interface PrivateMessageAttrs {
    authorId: Types.ObjectId;
    recipientId: Types.ObjectId;
    content: string;
    creationDate: Date;
    seen: boolean;
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

interface PrivateMessageModel extends Model<PrivateMessageDoc> {
    build: (attrs: PrivateMessageAttrs) => PrivateMessageDoc;
}

export interface PrivateMessageDoc extends Document {
    authorId: Types.ObjectId;
    recipientId: Types.ObjectId;
    content: string;
    creationDate: Date;
    seen: boolean;
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

const PrivateMessageSchema = new Schema({
    authorId: { type: Types.ObjectId, required: true },
    recipientId: { type: Types.ObjectId, required: true },
    content: { type: String, required: false, default: "" },
    creationDate: { type: Date, required: true },
    seen: { type: Boolean, required: true, default: false },
    files: {
        type: [
            {
                title: { type: String, required: true },
                link: { type: String, required: true },
                mimetype: { type: String, required: true }
            },
        ], default: [], required: true, _id: false
    }
})

PrivateMessageSchema.statics.build = (attrs: PrivateMessageAttrs) => {
    return new PrivateMessage(attrs);
}

const PrivateMessage = model<PrivateMessageDoc, PrivateMessageModel>("PrivateMessage", PrivateMessageSchema);

export default PrivateMessage