import { Request } from 'express';
import { Types, SortOrder } from 'mongoose';
import { SVHMetadataDoc } from '../types/SVHMetadata';
import { body } from 'express-validator';

export interface createSVHMetadataAttrs {
    title: string;
    description?: string;
    viewAccess: number;
}

export const createSVHMetadata = (req: Request, metadata: createSVHMetadataAttrs) => {
    const { tenantId } = req.params as { tenantId: string };
    const newMetadata = {
        ...metadata,
        tenantId: new Types.ObjectId(tenantId),
        authorId: new Types.ObjectId(req.currentUser!._id),
        title: metadata.title,
        description: metadata.description !== undefined ? metadata.description : "",
        viewAccess: metadata.viewAccess
    }
    return newMetadata;
}

export const createSVHMetadataChain = () => {
    return [
        body("title")
            .isString()
            .withMessage("Title muss ein String sein")
            .isLength({ min: 1 })
            .withMessage("Title darf nicht leer sein"),
        body("description")
            .optional()
            .isString()
            .withMessage("Description muss ein String sein"),
        body("viewAccess")
            .customSanitizer((value) => typeof value === "string" ? parseInt(value) : value)
            .isNumeric()
            .withMessage("ViewAccess muss eine Zahl sein")
            .isInt({ min: 0, max: 5 })
            .withMessage("ViewAccess darf nicht negativ sein")
    ]
}

export interface updateSVHMetadataAttrs {
    title?: string;
    description?: string;
    viewAccess?: number;
}

export const updateSVHMetadata = (document: SVHMetadataDoc, metadata: updateSVHMetadataAttrs) => {
    document.title = metadata.title !== undefined ? metadata.title : document.title;
    document.description = metadata.description !== undefined ? metadata.description : document.description;
    document.viewAccess = metadata.viewAccess !== undefined ? metadata.viewAccess : document.viewAccess;

    return {
        ...metadata,
        ...document
    }
}

export const updateSVHMetadataChain = () => {
    return [
        body("title")
            .optional()
            .isString()
            .withMessage("Title muss ein String sein")
            .isLength({ min: 1 })
            .withMessage("Title darf nicht leer sein"),
        body("description")
            .optional()
            .isString()
            .withMessage("Description muss ein String sein"),
        body("viewAccess")
            .optional()
            .customSanitizer((value) => typeof value === "string" ? parseInt(value) : value)
            .isNumeric()
            .withMessage("ViewAccess muss eine Zahl sein")
            .isInt({ min: 0, max: 5 })
            .withMessage("ViewAccess darf nicht negativ sein")
    ]
}

export interface readSVHQuery {
    text?: string;
    sort?: Record<string, any>;
    cursor?: string;
}

export const readSVH = (query: readSVHQuery) => {
    let condition: Record<string, any> = {};

    // Text Search
    if (query.text) {
        condition = {
            ...condition,
            $or: [
                { title: { $regex: query.text, $options: 'i' } },
                { description: { $regex: query.text, $options: 'i' } },
            ],
        };
    }

    let sort = query.sort
        ? Object.fromEntries(
            Object.entries(query.sort).map(([key, value]) => {
                return [key, parseInt(value) as SortOrder];
            })
        )
        : { updatedAt: -1 as SortOrder };

    if (query.cursor) {
        const [sortField, sortOrder] = Object.entries(sort)[0];

        condition = {
            ...condition,
            [sortField]: sortOrder === 1
                ? { $gt: (sortField === "updatedAt" || sortField === "createdAt") ? new Date(query.cursor) : query.cursor }
                : { $lt: (sortField === "updatedAt" || sortField === "createdAt") ? new Date(query.cursor) : query.cursor },
        };
    }

    return { condition, sort };
}