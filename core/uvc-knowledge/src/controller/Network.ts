import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import ContactGroup from "../models/ContactGroup";
import Wiki from "../models/Wiki";

export const resetKnowledgeACL = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const contactGroups = await ContactGroup.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const contactGroup of contactGroups) {
            contactGroup.authorId = new Types.ObjectId();
            await contactGroup.save();
        }
        const wikis = await Wiki.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const wiki of wikis) {
            wiki.authorId = new Types.ObjectId();
            await wiki.save();
        }
        res.status(200).send("Success");
    } catch (err) {
        next(err);
    }
}