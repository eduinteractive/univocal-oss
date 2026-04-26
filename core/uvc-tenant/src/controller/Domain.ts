import { NextFunction, Request, Response } from 'express';
import Domain from '../models/Domain';
import { NotFoundError } from '@eduinteractive/uvc-common';

// Create CRUD Operations for Domain on the basis of Domain.ts Model

interface createDomainRequest {
    title: string;
    shortcode: string;
    idpIdentifier?: string;
}

// Create a new Domain
export const createDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createDomainRequest;
        const domain = Domain.build({
            title: body.title,
            shortcode: body.shortcode,
            idpIdentifier: body.idpIdentifier,
        });
        await domain.save();
        res.status(201).json(domain);
    } catch (err) {
        next(err);
    }
}

// Get all Domains
export const getDomains = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const domains = await Domain.find({});
        res.status(200).json(domains);
    } catch (err) {
        next(err);
    }
}

// Get a single Domain
export const getDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domainId } = req.params;
        const domain = await Domain.findById(domainId);
        if (!domain) {
            throw new NotFoundError("Domain nicht gefunden!");
        }
        res.status(200).json(domain);
    } catch (err) {
        next(err);
    }
}

// Update a Domain
interface updateDomainRequest {
    title?: string;
    shortcode?: string;
    idpIdentifier?: string;
}

export const updateDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domainId } = req.params;
        const body = req.body as updateDomainRequest;
        const domain = await Domain.findById(domainId);
        if (!domain) {
            throw new NotFoundError("Domain nicht gefunden");
        }
        domain.title = body.title !== undefined ? body.title : domain.title;
        domain.shortcode = body.shortcode !== undefined ? body.shortcode : domain.shortcode;
        domain.idpIdentifier = body.idpIdentifier !== undefined ? body.idpIdentifier : domain.idpIdentifier;
        await domain.save();
        res.status(200).json(domain);
    } catch (err) {
        next(err);
    }
}

// Delete a Domain
export const deleteDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domainId } = req.params;
        const domain = await Domain.findById(domainId);
        if (!domain) {
            throw new NotFoundError("Domain nicht gefunden");
        }
        await domain.deleteOne();
        res.status(200).send("Domain gelöscht");
    } catch (err) {
        next(err);
    }
}