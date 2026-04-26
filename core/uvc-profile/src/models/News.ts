import { Document, Model, Schema, Types, model } from "mongoose";
import { ProfileObjectStatus } from "./Profile";

interface NewsAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
}

interface NewsModel extends Model<NewsDoc> {
    build: (attrs: NewsAttrs) => NewsDoc;
}

export interface NewsDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
}

const NewsSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    authorId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    status: { type: String, required: true, enum: Object.values(ProfileObjectStatus) },
    publishDate: { type: Date }
}, { timestamps: true })

NewsSchema.statics.build = (attrs: NewsAttrs) => {
    return new News(attrs);
}

const News = model<NewsDoc, NewsModel>("News", NewsSchema);

export default News