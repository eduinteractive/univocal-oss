import { Request, Response, NextFunction } from "express";
import Wiki, { ToCAttrs, WikiDoc } from "../models/Wiki";
import { Types } from "mongoose";
import { APIError, createSVHMetadata, createSVHMetadataAttrs, deleteFile, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, uploadFiles } from "@eduinteractive/uvc-common";
import WikiSection, { WikiSectionDoc, WikiSectionType } from "../models/WikiSection";
import * as Etherpad from "../services/Etherpad";

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
        if (wiki.etherpadGroupId) {
            await Etherpad.deleteGroup(wiki.etherpadGroupId);
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
        if (section.type !== "etherpad") {
            section.content = body.content ? body.content : section.content;
        }

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
            if (section.etherpadPadId) {
                await Etherpad.deletePad(section.etherpadPadId);
            }
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

const loadWikiSection = async (req: Request) => {
    const { wikiId, tenantId, sectionId } = req.params as { wikiId: string, tenantId: string, sectionId: string };
    const wiki = await Wiki.findById(wikiId) as WikiDoc;
    if (!hasReadPermission(wiki, tenantId, req.currentGroup!.permissionLevel)) {
        throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.");
    }
    const section = await WikiSection.findById(sectionId);
    if (!section || !section.wikiId.equals(wiki._id)) {
        throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.");
    }
    return { wiki, section };
};

const ensureEtherpadGroup = async (wiki: WikiDoc) => {
    if (wiki.etherpadGroupId) {
        return wiki.etherpadGroupId;
    }
    const groupID = await Etherpad.createGroup();
    wiki.etherpadGroupId = groupID;
    await wiki.save();
    return groupID;
};

const canEditWiki = (req: Request, wiki: WikiDoc) => {
    return Boolean(req.permission) || Boolean(req.currentUser && wiki.authorId.equals(req.currentUser._id));
};

interface setWikiSectionTypeRequest {
    type: WikiSectionType;
}

export const setWikiSectionType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as setWikiSectionTypeRequest;
        const { wiki, section } = await loadWikiSection(req);
        if (section.type) {
            throw new APIError("ConflictError", "Der Kapiteltyp ist bereits festgelegt.", 409);
        }
        if (body.type === "editor") {
            section.type = "editor";
            await section.save();
            res.status(200).json(section);
            return;
        }

        const groupID = await ensureEtherpadGroup(wiki);
        section.etherpadPadId = await Etherpad.createGroupPad(groupID, section._id.toString());
        section.type = "etherpad";
        await section.save();
        res.status(200).json(section);
    } catch (error) {
        next(error);
    }
};

const setEtherpadSessionCookie = (req: Request, res: Response, sessionID: string) => {
    res.cookie(Etherpad.sessionCookieName, Etherpad.sessionCookieValue(req.headers.cookie, sessionID), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
        secure: req.secure || req.get("x-forwarded-proto") === "https",
    });
};

export const launchWikiSectionEtherpad = (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const launch = Etherpad.readLaunchToken(token);
    if (!launch) {
        res.status(400).type("text/plain").send("Der Etherpad-Link ist abgelaufen. Bitte das Kapitel erneut öffnen.");
        return;
    }
    setEtherpadSessionCookie(req, res, launch.sessionID);
    res.redirect(302, launch.url);
};

export const getWikiSectionEtherpad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { wiki, section } = await loadWikiSection(req);
        if (section.type !== "etherpad" || !section.etherpadPadId || !wiki.etherpadGroupId) {
            throw new NotFoundError("Für dieses Kapitel gibt es kein Etherpad.");
        }
        const userName = req.currentUser?.mail || "Gast";
        const authorID = await Etherpad.createAuthor(req.currentUser!._id, userName);
        const sessionID = await Etherpad.createSession(wiki.etherpadGroupId, authorID);
        const padID = canEditWiki(req, wiki)
            ? section.etherpadPadId
            : await Etherpad.getReadOnlyID(section.etherpadPadId);
        const url = Etherpad.padUrl(padID, userName);
        setEtherpadSessionCookie(req, res, sessionID);
        res.status(200).json({ url, launchUrl: Etherpad.launchUrl(sessionID, url) });
    } catch (error) {
        next(error);
    }
};

export const syncWikiSectionEtherpad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { section } = await loadWikiSection(req);
        if (section.type !== "etherpad" || !section.etherpadPadId) {
            throw new NotFoundError("Für dieses Kapitel gibt es kein Etherpad.");
        }
        section.content = await Etherpad.getHTML(section.etherpadPadId);
        await section.save();
        res.status(200).json(section);
    } catch (error) {
        next(error);
    }
};