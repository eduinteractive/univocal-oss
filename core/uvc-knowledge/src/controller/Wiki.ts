import { Request, Response, NextFunction } from "express";
import Wiki, { ToCAttrs, WikiDoc } from "../models/Wiki";
import { Types } from "mongoose";
import { createSVHMetadata, createSVHMetadataAttrs, deleteFile, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, uploadFiles } from "@eduinteractive/uvc-common";
import WikiSection, { WikiSectionDoc } from "../models/WikiSection";

// CRUD Operations for Wikis

interface getWikisQuery extends readSVHQuery { }

export const getWikis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getWikisQuery);

        let sectionsWithQuery: WikiSectionDoc[] = [];

        if (svhFilter.condition?.text) {
            sectionsWithQuery = await WikiSection.find({
                $or: [
                    { title: { $regex: svhFilter.condition?.text, $options: 'i' } },
                    { content: { $regex: svhFilter.condition?.text, $options: 'i' } }
                ]
            });
        }

        const wikiIdsFromSections = sectionsWithQuery.map(section => section.wikiId.toString());

        const wikis = await Wiki.find({
            tenantId: new Types.ObjectId(tenantId),
            viewAccess: { $lte: req.currentGroup?.permissionLevel },
            $or: [svhFilter.condition, { _id: { $in: wikiIdsFromSections } }]
        }).sort(svhFilter.sort);

        res.status(200).json(wikis);
    } catch (err) {
        next(err);
    }
}

export const getWiki = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wikiId, tenantId } = req.params as { wikiId: string, tenantId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        res.status(200).json(wiki);
    } catch (error) {
        next(error);
    }
}

interface createWikiRequest extends createSVHMetadataAttrs {}

export const createWiki = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createWikiRequest;
        const wikiAttrs = createSVHMetadata(req, body);

        const wiki = Wiki.build({
            ...wikiAttrs,
            tableOfContents: []
        });
        await wiki.save();
        res.status(201).json(wiki);
    } catch (error) {
        next(error);
    }
}

interface updateWikiRequest extends createSVHMetadataAttrs {
    tableOfContents?: ToCAttrs[];
}

export const updateWiki = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateWikiRequest;
        const { wikiId, tenantId } = req.params as { wikiId: string, tenantId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        updateSVHMetadata(wiki, body);
        wiki.tableOfContents = req.body.tableOfContents !== undefined ? req.body.tableOfContents : wiki.tableOfContents;
        await wiki.save();
        res.status(200).json(wiki);
    } catch (error) {
        next(error);
    }
}

export const deleteWiki = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wikiId, tenantId } = req.params as { wikiId: string, tenantId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        await WikiSection.deleteMany({ wikiId: wiki._id });
        await wiki.deleteOne();
        res.status(204).json({ message: "Der Eintrag wurde gelöscht." });
    } catch (error) {
        next(error);
    }
}

// Table of Contents Operations

interface createWikiSectionRequest {
    title: string;
    parent?: string;
    index?: number;
}

export const createWikiSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createWikiSectionRequest;
        const { wikiId, tenantId } = req.params as { wikiId: string, tenantId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        const newWikiSection = WikiSection.build({
            wikiId: new Types.ObjectId(wikiId),
            title: body.title,
            materials: [],
        });
        await newWikiSection.save();

        let inserted = false;
        if (body.parent) {
            const recursiveInsert = (tocArray: ToCAttrs[], parent: string, sectionId: Types.ObjectId, index?: number) => {
                tocArray.forEach((toc: ToCAttrs, idx: number) => {
                    if (toc.sectionId.toString() === parent) {
                        toc.children?.splice(index !== undefined ? index : toc.children.length, 0, {
                            title: body.title,
                            sectionId: sectionId,
                            children: []
                        });
                        inserted = true;
                    } else if (toc.children && toc.children.length > 0) {
                        recursiveInsert(toc.children, parent, sectionId, index);
                    }
                });
            };

            recursiveInsert(wiki.tableOfContents, body.parent, newWikiSection._id, body.index);
        }

        if (!inserted) {
            if (body.index === undefined) {
                wiki.tableOfContents.push({
                    title: body.title,
                    sectionId: newWikiSection._id,
                    children: []
                });
            } else {
                wiki.tableOfContents.splice(body.index, 0, {
                    title: body.title,
                    sectionId: newWikiSection._id,
                    children: []
                });
            }
        }

        await wiki.save();
        res.status(201).json(newWikiSection);
    } catch (error) {
        next(error);
    }
}

export const getWikiSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wikiId, tenantId } = req.params as { wikiId: string, tenantId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        const section = await WikiSection.findById(req.params.sectionId);
        if (!section || !section.wikiId.equals(wiki._id)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        res.status(200).json(section);
    } catch (error) {
        next(error);
    }
}

interface updateWikiSectionRequest {
    title: string;
    content?: string;
    materials?: { title: string, link: string, mimetype: string }[];
}

export const updateWikiSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wikiId, tenantId, sectionId } = req.params as { wikiId: string, tenantId: string, sectionId: string };
        const body = req.body as updateWikiSectionRequest;
        body.materials = typeof body.materials === "string" ? JSON.parse(body.materials) : body.materials as { title: string, link: string, mimetype: string }[];
        
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.");
        }
        
        const section = await WikiSection.findById(sectionId);
        if (!section || !section.wikiId.equals(wiki._id)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        section.content = body.content ? body.content : section.content;

        if (body.title !== section.title) {

            const recursiveUpdate = (tocArray: ToCAttrs[], sectionId: Types.ObjectId) => {
                tocArray.forEach((toc: ToCAttrs) => {
                    if (toc.sectionId.toString() === sectionId.toString()) {
                        toc.title = body.title;
                    } else if (toc.children && toc.children.length > 0) {
                        recursiveUpdate(toc.children, sectionId);
                    }
                });
            };

            recursiveUpdate(wiki.tableOfContents, section._id);
            await wiki.save();
        }
        section.title = body.title;

        if (body.materials !== undefined) {
            const materialsToDelete = section.materials.filter(material => !body.materials?.some(newMaterial => newMaterial.link === material.link));
            for (const material of materialsToDelete) {
                await deleteFile(material.link);
            };

            section.materials = body.materials;

            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                const fileData = await uploadFiles(req.params.tenantId + "/" + wiki._id + "/" + section._id, req.files);
                section.materials = [
                    ...body.materials,
                    ...fileData.map(file => ({
                        title: file.fileName,
                        link: file.url,
                        mimetype: file.mimeType
                    }))
                ]
                section.markModified("materials");
            }
        }
        await section.save();
        res.status(200).json(section);
    } catch (error) {
        next(error);
    }
}

export const deleteWikiSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wikiId, tenantId, sectionId } = req.params as { wikiId: string, tenantId: string, sectionId: string };
        const wiki = await Wiki.findById(wikiId) as WikiDoc;
        if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.");
        }
        let section = await WikiSection.findById(sectionId);
        if (!section || !section.wikiId.equals(wiki._id)) {
            section = {
                _id: new Types.ObjectId(sectionId)
            } as any;
        }

        const recursiveDelete = async (tocArray: ToCAttrs[], sectionId: Types.ObjectId): Promise<ToCAttrs[]> => {
            const updatedToCArray: ToCAttrs[] = [];
            for (const toc of tocArray) {
                if (toc.sectionId.toString() === sectionId.toString()) {
                    await WikiSection.deleteOne({ _id: sectionId });
                } else {
                    if (toc.children && toc.children.length > 0) {
                        toc.children = await recursiveDelete(toc.children, sectionId);
                    }
                    updatedToCArray.push(toc);
                }
            }
            return updatedToCArray;
        };

        wiki.tableOfContents = await recursiveDelete(wiki.tableOfContents, new Types.ObjectId(sectionId));

        if (section?.deleteOne) {
            for (const material of section.materials) {
                await deleteFile(material.link)
            }
            await section.deleteOne();
        }
        await wiki.save();
        res.status(204).json({ message: "Der Eintrag wurde gelöscht." });
    } catch (error) {
        next(error);
    }
}