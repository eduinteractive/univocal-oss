import { Document, model, Model, Schema, Types } from "mongoose";

interface ProjectTaskAttrs {
    title: string;
    description?: string;
    subtasks: {
        _id: Types.ObjectId;
        title: string;
        description?: string;
        dueDate?: Date;
        owner?: Types.ObjectId;
        done?: boolean;
    }[];
    dueDate?: Date;
    color?: string;
    owner?: Types.ObjectId;
    connectors: {
        origin: string;
        target: string;
    }[];
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
}

interface ProjectTaskModel extends Model<ProjectTaskDoc> {
    build: (attrs: ProjectTaskAttrs) => ProjectTaskDoc;
}

export interface ProjectTaskDoc extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    subtasks: {
        _id: Types.ObjectId;
        title: string;
        description?: string;
        dueDate?: Date;
        owner?: Types.ObjectId;
        done?: boolean;
    }[];
    dueDate?: Date;
    color?: string;
    owner?: Types.ObjectId;
    connectors: {
        origin: string;
        target: string;
    }[];
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
    createdAt: Date;
    updatedAt: Date;
}

const ProjectTaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    subtasks: {
        type: [{
            _id: {
                type: Types.ObjectId,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            dueDate: {
                type: Date
            },
            owner: {
                type: Types.ObjectId,
                ref: "User"
            },
            done: {
                type: Boolean,
                default: false
            }
        }],
        default: [],
        required: true,
    },
    dueDate: {
        type: Date
    },
    color: {
        type: String
    },
    owner: {
        type: Types.ObjectId,
        ref: "User"
    },
    connectors: {
        type: [{
            origin: {
                type: String,
                required: true
            },
            target: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    materials: {
        type: [
            {
                title: { type: String, required: true },
                link: { type: String, required: true },
                mimetype: { type: String, required: true }
            },
        ], default: [], required: true, _id: false
    }
}, { timestamps: true });

ProjectTaskSchema.statics.build = (attrs: ProjectTaskAttrs) => {
    return new ProjectTask(attrs);
}

const ProjectTask = model<ProjectTaskDoc, ProjectTaskModel>("ProjectTask", ProjectTaskSchema);

export default ProjectTask

