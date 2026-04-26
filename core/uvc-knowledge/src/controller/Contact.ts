import { Request, Response, NextFunction } from "express";
import ContactGroup, { ContactGroupDoc } from "../models/ContactGroup";
import { Types } from "mongoose";
import Contact, { ContactDoc } from "../models/Contact";
import { createSVHMetadata, createSVHMetadataAttrs, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs } from "@eduinteractive/uvc-common";

interface getContactGroupsQuery extends readSVHQuery {}

export const getContactGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getContactGroupsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };

        const contactGroups = await ContactGroup.find(condition).sort(svhFilter.sort);
        res.status(200).json(contactGroups);
    } catch (error) {
        next(error);
    }
}

interface createContactGroupRequest extends createSVHMetadataAttrs {}

export const createContactGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createContactGroupRequest;

        const contactGroupAttrs = createSVHMetadata(req, body);

        const contactGroup = ContactGroup.build(contactGroupAttrs);
        await contactGroup.save();
        res.status(201).json(contactGroup);
    } catch (error) {
        next(error);
    }
}

interface getContactGroupQuery extends readSVHQuery {}

export const getContactGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getContactGroupQuery;
        const svhFilter = readSVH(query);
        const { contactGroupId, tenantId } = req.params as { contactGroupId: string, tenantId: string };
        const contactGroup = await ContactGroup.findById(contactGroupId) as ContactGroupDoc;
        if (!hasReadPermission(contactGroup, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        const contacts = await Contact.find({ contactGroupIds: { $in: [contactGroup._id] }, $or: [
            svhFilter.condition,
            { email: { $regex: query.text || "", $options: "i" } }
        ] });
        res.status(200).json({
            contactGroup,
            contacts
        });
    } catch (error) {
        next(error);
    }
}

interface updateContactGroupRequest extends updateSVHMetadataAttrs {}

export const updateContactGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contactGroupId, tenantId } = req.params as { contactGroupId: string, tenantId: string };
        const body = req.body as updateContactGroupRequest;
        const contactGroup = await ContactGroup.findById(contactGroupId) as ContactGroupDoc;
        if (!hasReadPermission(contactGroup, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        updateSVHMetadata(contactGroup, body);
        await contactGroup.save();
        res.status(200).json(contactGroup);
    } catch (error) {
        next(error);
    }
}

export const deleteContactGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contactGroupId, tenantId } = req.params as { contactGroupId: string, tenantId: string };
        const contactGroup = await ContactGroup.findById(contactGroupId) as ContactGroupDoc;
        if (!hasReadPermission(contactGroup, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        const contacts = await Contact.find({ contactGroupIds: { $in: [contactGroup._id] } });
        if (contacts.length > 0) {
            for (let contact of contacts) {
                if (contact.contactGroupIds.length === 1) {
                    await contact.deleteOne();
                }
            }
        }
        await contactGroup.deleteOne();
        res.status(200).json(contactGroup);
    } catch (error) {
        next(error);
    }
}

// CRUD Operations for Contacts

interface createContactRequest {
    contactGroupIds: string[],
    title?: string,
    firstName?: string,
    lastName?: string,
    email: string,
    phone?: string,
    description?: string,
    street?: string,
    zip?: string,
    city?: string
}

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createContactRequest;
        const contact = Contact.build({
            contactGroupIds: body.contactGroupIds.map((id: string) => new Types.ObjectId(id)),
            title: body.title,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            description: body.description,
            street: body.street,
            zip: body.zip,
            city: body.city
        });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        next(error);
    }
}

interface createMultipleContactsRequest {
    contacts: {
        contactGroupIds: string[],
        title?: string,
        firstName?: string,
        lastName?: string,
        email?: string,
        phone?: string,
        description?: string,
        street?: string,
        zip?: string,
        city?: string
    }[]
}

export const createMultipleContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createMultipleContactsRequest
        const contacts = body.contacts.map((contact: any) => {
            return Contact.build({
                contactGroupIds: contact.contactGroupIds.map((id: string) => new Types.ObjectId(id)),
                title: contact.title,
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                description: contact.description,
                street: contact.street,
                zip: contact.zip,
                city: contact.city
            });
        });
        await Contact.insertMany(contacts);
        res.status(201).json(contacts);
    } catch (error) {
        next(error);
    }
}

interface updateContactRequest {
    contactGroupIds?: string[],
    title?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    description?: string,
    street?: string,
    zip?: string,
    city?: string
}

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateContactRequest;
        const contact = await Contact.findById(req.params.contactId)
        if (!contact) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        contact.contactGroupIds = body.contactGroupIds !== undefined ? body.contactGroupIds.map((id: string) => new Types.ObjectId(id)) : contact.contactGroupIds;
        contact.title = body.title !== undefined ? body.title : contact.title;
        contact.firstName = body.firstName !== undefined ? body.firstName : contact.firstName;
        contact.lastName = body.lastName !== undefined ? body.lastName : contact.lastName;
        contact.email = body.email !== undefined ? body.email : contact.email;
        contact.phone = body.phone !== undefined ? body.phone : contact.phone;
        contact.description = body.description !== undefined ? body.description : contact.description;
        contact.street = body.street !== undefined ? body.street : contact.street;
        contact.zip = body.zip !== undefined ? body.zip : contact.zip;
        contact.city = body.city !== undefined ? body.city : contact.city;
        await contact.save();
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
}

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await Contact.findById(req.params.contactId);
        if (!contact) {
            throw new NotFoundError("Der Eintrag konnte nicht gefunden werden.")
        }
        await contact.deleteOne();
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
}
