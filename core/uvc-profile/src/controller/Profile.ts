import { NextFunction, Request, Response } from "express";
// Create CRUD Operations for Profile on the basis of Profile.ts Model

import Profile from "../models/Profile";
import { Types } from "mongoose";
import News from "../models/News";
import Project from "../models/Project";
import { hasReadPermission, NotFoundError, SVHMetadataDoc, uploadFile } from "@eduinteractive/uvc-common";

interface createProfileRequest {
    tenantId: string;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
}

// Create a new Profile

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createProfileRequest;
        const profile = Profile.build({
            ...body,
            tenantId: new Types.ObjectId(body.tenantId),
        });
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        next(err);
    }
}

// Get Profile

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const profile = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) });
        if (!hasReadPermission(profile as unknown as Partial<SVHMetadataDoc>, tenantId)) {
            throw new NotFoundError("SV-Profil nicht gefunden!");
        }
        const news = await News.find({ tenantId: new Types.ObjectId(tenantId) }).limit(3).sort({ creationDate: -1 });
        const projects = await Project.find({ tenantId: new Types.ObjectId(tenantId) }).limit(3).sort({ creationDate: -1 });
        res.status(200).json({
            profile,
            news,
            projects,
        });
    } catch (err) {
        next(err);
    }
}

// Update Profile

interface updateProfileRequest {
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as updateProfileRequest;
        const profile = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) });
        if (!profile) {
            /** DEV-PURPOSES **/
            await createProfile({ ...req, body: { ...body, tenantId: tenantId } } as Request, res, next);
            return;
        }
        profile.set({
            description: body.description !== undefined ? body.description : profile.description,
            contactPerson: body.contactPerson !== undefined ? body.contactPerson : profile.contactPerson,
            contactEmail: body.contactEmail !== undefined ? body.contactEmail : profile.contactEmail,
            contactPhone: body.contactPhone !== undefined ? body.contactPhone : profile.contactPhone,
            contactWebsite: body.contactWebsite !== undefined ? body.contactWebsite : profile.contactWebsite,
            publicPerson: body.publicPerson !== undefined ? body.publicPerson : profile.publicPerson, 
            avatarImage: body.avatarImage,
        });
        if (req.file) {
            // Extract the file extension
            const fileExtension = req.file.originalname.split('.').pop();

            const location = await uploadFile(tenantId + "/" + "avatar." + fileExtension , req.file)
            profile.avatarImage = location;
        }
        await profile.save();
        res.status(200).json(profile);
    } catch (err) {
        next(err);
    }
}

interface updateProfileBackgroundRequest {
    backgroundImage?: string;
}

export const updateProfileBackground = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as updateProfileBackgroundRequest;
        const profile = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) })
        if (!profile) {
            await createProfile({...req, body: { tenantId: tenantId }} as Request, res, next)
            await updateProfileBackground(req, res, next);
            return;
        }
        if (req.file) {
            const fileExtension = req.file.originalname.split('.').pop();
            const location = await uploadFile(tenantId + "/" + "background." + fileExtension, req.file);
            profile.backgroundImage = location;
        } else {
            profile.backgroundImage = body.backgroundImage
        }
        await profile.save()
        res.status(200).json(profile)
    } catch(err) {
        next(err);
    }
}

// Delete Profile

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const profile = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) });
        if (!profile) {
            throw new NotFoundError("SV-Profil nicht gefunden!");
        }
        await profile.deleteOne();
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}