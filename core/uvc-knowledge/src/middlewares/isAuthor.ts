import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '@eduinteractive/uvc-common';
import Wiki from '../models/Wiki';
import ContactGroup from '../models/ContactGroup';

export const isWikiAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wiki = await Wiki.findById(req.params.wikiId);
        if (!wiki) {
            throw new NotFoundError("Wiki nicht gefunden!");
        }

        if (!req.permission && !wiki.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }

        next();
    } catch (err) {
        next(err)
    }
}

export const isContactGroupAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contactGroup = await ContactGroup.findById(req.params.contactGroupId);
        if (!contactGroup) {
            throw new NotFoundError("Kontaktgruppe nicht gefunden!");
        }

        if (!req.permission && !contactGroup.authorId.equals(req.currentUser?._id)) {
            throw new ForbiddenError("Du hast keine Berechtigung für diese Aktion!");
        }
    } catch (err) {
        next(err);
    }
}