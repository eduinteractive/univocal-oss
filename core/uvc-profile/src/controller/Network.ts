import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import News from "../models/News";
import Project from "../models/Project";

export const resetProfileACL = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const news = await News.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const n of news) {
            n.authorId = new Types.ObjectId();
            await n.save();
        }
        const projects = await Project.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const project of projects) {
            project.authorId = new Types.ObjectId();
            await project.save();
        }
        res.status(200).send("Success");
    } catch (err) {
        next(err);
    }
}