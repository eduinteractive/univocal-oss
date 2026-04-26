import { Document, Model, Schema, Types, model } from "mongoose";
import { ProfileObjectStatus } from "./Profile";


interface ProjectAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
}

interface ProjectModel extends Model<ProjectDoc> {
    build: (attrs: ProjectAttrs) => ProjectDoc;
}

export interface ProjectDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
}

const ProjectSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    authorId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    status: { type: String, required: true, enum: Object.values(ProfileObjectStatus) },
    publishDate: { type: Date }
}, { timestamps: true })

ProjectSchema.statics.build = (attrs: ProjectAttrs) => {
    return new Project(attrs);
}

const Project = model<ProjectDoc, ProjectModel>("Project", ProjectSchema);

export default Project