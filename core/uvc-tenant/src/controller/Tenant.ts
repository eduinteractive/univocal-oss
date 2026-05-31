import Tenant, { TenantDoc, TenantVisibility } from "../models/Tenant";
import { NextFunction, Request, Response } from "express";
import { AnyBulkWriteOperation, Types } from "mongoose";
import Domain, { DomainDoc } from "../models/Domain";
import TenantNotification, { TenantNotificationType } from "../models/TenantNotification";
import { AuthProvider, NetworkAxios, NotFoundError, PERMISSION_LEVEL, sendBrevoMail } from "@eduinteractive/uvc-common";

interface getTenantsQuery {
    domain?: string;
    visibility?: string;
}

export const getTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition: Record<string, any> = {};
        const query = req.query as getTenantsQuery;
        if (query.domain) {
            condition.domain = new Types.ObjectId(query.domain as string);
        }
        if (query.visibility !== undefined) {
            condition.visibility = query.visibility as TenantVisibility;
            condition.domain = { $in: [] };
            if (query.visibility === TenantVisibility.PUBLIC) {
                condition.visibility = { $ne: TenantVisibility.HIDDEN };
                if (req.currentUser?.authProvider === AuthProvider.DFN_AAI) {
                    const idpIdentifier = req.currentUser?.schacHomeOrganization;
                    if (idpIdentifier) {
                        const domain = await Domain.findOne({ idpIdentifier: idpIdentifier });
                        if (domain) {
                            condition.domain = { $in: [domain._id] };
                        }
                    }
                }
            }
        }

        const tenants = await Tenant.find(condition).sort({ title: 1 }).populate('domain') as unknown as (TenantDoc & { domain: DomainDoc })[];
        res.status(200).json(tenants);
    } catch (err) {
        next(err);
    }
}

interface getTenantUsersQuery {
    text?: string;
}

export const getTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getTenantUsersQuery;
        const tenant = await Tenant.findById(req.params.tenantId).populate('domain') as unknown as TenantDoc & { domain: DomainDoc };
        const isAdmin = req.currentUser?.permissionLevel && req.currentUser?.permissionLevel >= PERMISSION_LEVEL.SV_HUB_MODERATION;
        const users = await NetworkAxios.get('http://uvc-auth-srv:3001/api/auth/network/users/tenant/' + req.params.tenantId, {
            params: {
                ...req.query as getTenantUsersQuery,
                isAdmin: isAdmin
            }
        });
        if (!tenant) {
            throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
        }
        let response = { tenant, users: users.data };
        if (query.text) {
            response = { ...response, users: users.data.filter((user: any) => user.mail?.includes(query.text) || (user.firstName + user.lastName)?.includes(query.text)) };
        }
        res.status(200).json({ tenant, users: users.data });
    } catch (err) {
        next(err);
    }
}

export const getPublicTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenant = await Tenant.findById(req.params.tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
        }
        res.status(200).json(tenant);
    } catch (err) {
        next(err);
    }
}

interface createTenantsRequest {
    title: string;
    description?: string;
    domain: string;
    visibility: TenantVisibility;
    integrations?: {
        dashboard: boolean;
        documentation: boolean;
        calendar: boolean;
        survey: boolean;
        chat: boolean;
        budget: boolean;
        knowledge: boolean;
        event: boolean;
        project: boolean;
    }
}

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createTenantsRequest;
        const { domainId } = req.params as { domainId: string };
        const tenant = Tenant.build({
            title: body.title,
            description: body.description,
            domain: domainId ? new Types.ObjectId(domainId) : new Types.ObjectId(body.domain),
            visibility: body.visibility,
            integrations: {
                dashboard: body.integrations?.dashboard || false,
                documentation: body.integrations?.documentation || false,
                calendar: body.integrations?.calendar || false,
                survey: body.integrations?.survey || false,
                chat: body.integrations?.chat || false,
                budget: body.integrations?.budget || false,
                knowledge: body.integrations?.knowledge || false,
                event: body.integrations?.event || false,
                project: body.integrations?.project || false,
            }
        });
        await tenant.save();
        res.status(201).json(tenant);
    } catch (err) {
        next(err);
    }
}

interface updateTenantRequest {
    title: string;
    description?: string;
    domain: string;
    visibility?: TenantVisibility;
    integrations?: {
        dashboard: boolean;
        documentation: boolean;
        calendar: boolean;
        survey: boolean;
        chat: boolean;
        budget: boolean;
        knowledge: boolean;
        project: boolean;
    }
}

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as updateTenantRequest;
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
        }

        if (body.integrations) {
            for (const key in body.integrations) {
                tenant.integrations[key as keyof typeof body.integrations] = body.integrations[key as keyof typeof body.integrations];
            }
            tenant.markModified('integrations');
        }
        if (body.visibility !== undefined) {
            tenant.visibility = body.visibility;
        }
        await tenant.save();
        res.status(200).json(tenant);
    } catch (err) {
        next(err);
    }
}

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
        }
        await tenant.deleteOne();
        res.status(200).send("Tenant deleted");
    } catch (err) {
        next(err);
    }
}

interface importTenantsRequest {
    domain: string;
    data: {
        name: string;
    }[];
}

export const importTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as importTenantsRequest;

        // Erstelle die Bulk-Operationen für Insert oder Update
        const operations = body.data.map(tenantData => ({
            updateOne: {
                filter: { title: tenantData.name }, // Filter nach dem Namen des Tenants
                update: { $set: { domain: body.domain ? new Types.ObjectId(body.domain) : undefined, visibility: TenantVisibility.HIDDEN, integrations: { dashboard: true, documentation: true, calendar: true, survey: false, chat: true, budget: false, knowledge: false, event: false } } }, // Aktualisiere oder füge den Typ und die anderen Felder hinzu
                upsert: true // Führe ein Insert aus, falls kein Dokument mit diesem Filter existiert
            }
        }));

        // Führe die Bulk-Operationen aus
        const result = await Tenant.bulkWrite(operations as AnyBulkWriteOperation<TenantDoc>[]);

        // Sende die Erfolgsantwort zurück
        res.status(200).json({ message: 'Tenants successfully imported/updated', result });
    } catch (err) {
        next(err);
    }
}

/** User Functions **/

export const getUserTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userTenantIds = req.currentUser?.groups.map(group => group._id);
        if (!userTenantIds) {
            res.status(200).json([]);
            return;
        }

        const tenants = await Tenant.find({ _id: { $in: userTenantIds } });
        res.status(200).json(tenants);
    } catch (err) {
        next(err);
    }
}

/** Notification Functions **/

interface createNotificationRequest {
    content: string;
}

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as createNotificationRequest;
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
        }

        const notification = TenantNotification.build({
            tenantId: tenant._id,
            authorId: new Types.ObjectId(req.currentUser!._id),
            type: TenantNotificationType.INFO,
            content: body.content,
            creationDate: new Date(),
            seenBy: [new Types.ObjectId(req.currentUser!._id)],
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        next(err);
    }
}

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
        }

        const notifications = await TenantNotification.find({ tenantId: tenant._id });
        res.status(200).json(notifications);
    } catch (err) {
        next(err);
    }
}

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await TenantNotification.findById(req.params.notificationId);
        if (!notification) {
            throw new NotFoundError("Die Benachrichtigung wurde nicht gefunden.");
        }
        await notification.deleteOne();
        res.status(200).send("Notification deleted");
    } catch (err) {
        next(err);
    }
}

export const markNotificationAsSeen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await TenantNotification.findById(req.params.notificationId);
        if (!notification) {
            throw new NotFoundError("Die Benachrichtigung wurde nicht gefunden.");
        }
        notification.seenBy.push(new Types.ObjectId(req.currentUser!._id));
        await notification.save();
        res.status(200).json(notification);
    } catch (err) {
        next(err);
    }
}

export const getTenantDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = {
            'Cookie': req.headers.cookie,
            'Authorization': req.headers.authorization
        }

        const response = {
            calendarEvents: [],
            dashboardItems: [],
        }

        const items = await Promise.all([
            NetworkAxios.get(`http://uvc-calendar-srv:3004/api/calendar/tenant/${req.params.tenantId}/event`, { headers }),
            NetworkAxios.get(`http://uvc-event-srv:3008/api/event/tenant/${req.params.tenantId}/event`, { headers }),
            NetworkAxios.get(`http://uvc-knowledge-srv:3006/api/knowledge/tenant/${req.params.tenantId}/wiki`, { headers }),
            NetworkAxios.get(`http://uvc-profile-srv:3003/api/profile/tenant/${req.params.tenantId}/news`, { headers }),
            NetworkAxios.get(`http://uvc-profile-srv:3003/api/profile/tenant/${req.params.tenantId}/project`, { headers }),
            NetworkAxios.get(`http://uvc-project-srv:3009/api/project/tenant/${req.params.tenantId}/project`, { headers }),
            NetworkAxios.get(`http://uvc-survey-srv:3007/api/survey/tenant/${req.params.tenantId}/survey`, { headers }),
        ]);

        if (items[0].data) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start des heutigen Tages (00:00:00)
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1); // Start des morgigen Tages (00:00:00)

            response.calendarEvents = items[0].data.filter((item: any) => {

                const eventStart = new Date(item.startDate);
                const eventEnd = item.endDate ? new Date(item.endDate) : null;

                // Event läuft aktuell heute
                const isCurrentlyRunning = eventStart <= now && eventEnd && eventEnd > now;

                // Event beginnt heute: Startdatum ist heute (unabhängig von der Uhrzeit)
                const startsToday = eventStart >= today && eventStart < tomorrow;

                // Event endet heute: Enddatum ist heute (auch wenn es bereits beendet ist)
                const endsToday = eventEnd && eventEnd >= today && eventEnd < tomorrow;

                return startsToday || isCurrentlyRunning || endsToday;
            }).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }

        if (items[1].data) {
            response.dashboardItems = response.dashboardItems.concat(items[1].data.map((item: any) => ({
                ...item,
                type: 'EVENT'
            })));
        }

        if (items[2].data) {
            response.dashboardItems = response.dashboardItems.concat(items[2].data.map((item: any) => ({
                ...item,
                type: 'WIKI'
            })));
        }

        if (items[3].data) {
            response.dashboardItems = response.dashboardItems.concat(items[3].data.map((item: any) => ({
                ...item,
                type: 'PROFILE_NEWS'
            })));
        }

        if (items[4].data) {
            response.dashboardItems = response.dashboardItems.concat(items[4].data.map((item: any) => ({
                ...item,
                type: 'PROFILE_PROJECT'
            })));
        }

        if (items[5].data) {
            response.dashboardItems = response.dashboardItems.concat(items[5].data.map((item: any) => ({
                ...item,
                type: 'PROJECT'
            })));
        }

        if (items[6].data) {
            response.dashboardItems = response.dashboardItems.concat(items[6].data.map((item: any) => ({
                ...item,
                type: 'SURVEY'
            })));
        }

        response.dashboardItems = response.dashboardItems.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}

interface reportTenantIssue {
    type: "FEATURE_REQUEST" | "BUG_REPORT" | "OTHER";
    description: string;
    url: string;
}

export const reportTenantIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as reportTenantIssue;
        const tenantId = req.params.tenantId;
        let tenantLabel = "Keine Gruppe";

        if (tenantId) {
            const tenant = await Tenant.findById(tenantId);
            if (!tenant) {
                throw new NotFoundError("Die Gruppe wurde nicht gefunden.");
            }
            tenantLabel = tenant.title;
        }

        await sendBrevoMail({
            to: [{ email: process.env.SUPPORT_EMAIL! }],
            subject: `[Univocal] Issue gemeldet: ${body.type}`,
            html: `<p>Ein Issue wurde gemeldet.</p><p>Type: ${body.type}</p><p>Description: ${body.description}</p><p>URL: ${body.url}</p><p>Tenant: ${tenantLabel}</p>`,
        });
        res.status(200).send("Issue reported");
    } catch (err) {
        next(err);
    }
}