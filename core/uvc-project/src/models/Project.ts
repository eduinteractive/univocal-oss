import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { model, Model, Schema, Types } from "mongoose";

interface ProjectAttrs extends SVHMetadataAttrs {
    columns: {
        _id: Types.ObjectId;
        title: string;
        tasks: Types.ObjectId[];
    }[]
}

interface ProjectModel extends Model<ProjectDoc> {
    build: (attrs: ProjectAttrs) => ProjectDoc;
}

export interface ProjectDoc extends SVHMetadataDoc {
    columns: {
        _id: Types.ObjectId;
        title: string;
        tasks: Types.ObjectId[];
    }[]
}

const ProjectSchema = new Schema({
    columns: {
        type: [{
            _id: {
                type: Types.ObjectId,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            tasks: [{
                type: Types.ObjectId,
                ref: "Task"
            }]
        }],
        default: [],
        required: true,
    }
});

ProjectSchema.add(SVHMetadataSchema);

ProjectSchema.statics.build = (attrs: ProjectAttrs) => {
    return new Project(attrs);
}

const Project = model<ProjectDoc, ProjectModel>("Project", ProjectSchema);

export default Project