import { Document, Model, Schema, Types, model } from "mongoose";

interface GroupMessageAttrs {
    authorId: Types.ObjectId;
    tenantId: Types.ObjectId;
    content: string;
    creationDate: Date;
    seenBy: Types.ObjectId[];
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

interface GroupMessageModel extends Model<GroupMessageDoc> {
    build: (attrs: GroupMessageAttrs) => GroupMessageDoc;
}

export interface GroupMessageDoc extends Document {
    authorId: Types.ObjectId;
    tenantId: Types.ObjectId;
    content: string;
    creationDate: Date;
    seenBy: Types.ObjectId[];
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

const GroupMessageSchema = new Schema({
    authorId: { type: Types.ObjectId, required: true },
    tenantId: { type: Types.ObjectId, required: true },
    content: { type: String, required: false, default: "" },
    creationDate: { type: Date, required: true },
    seenBy: [{ type: Types.ObjectId, ref: 'User' }],
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

GroupMessageSchema.statics.build = (attrs: GroupMessageAttrs) => {
    return new GroupMessage(attrs);
}

const GroupMessage = model<GroupMessageDoc, GroupMessageModel>("GroupMessage", GroupMessageSchema);

export default GroupMessage