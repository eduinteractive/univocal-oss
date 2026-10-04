import { NetworkAxios, NotFoundError } from "@eduinteractive/uvc-common";
import { Types } from "mongoose";
import News from "../models/News";
import Profile, {
    defaultSiteSections,
    ProfileDoc,
    ProfileObjectStatus,
    ProfileSectionType,
    ProfileSiteSection,
    SITE_LAYOUTS,
    SiteLayoutPreset,
} from "../models/Profile";

const LEGACY_LAYOUTS: Record<string, SiteLayoutPreset> = {
    classic: "magazine",
    feed: "showcase",
};

const resolveLayout = (layout?: string): SiteLayoutPreset => {
    if (layout && (SITE_LAYOUTS as readonly string[]).includes(layout)) return layout as SiteLayoutPreset;
    if (layout && LEGACY_LAYOUTS[layout]) return LEGACY_LAYOUTS[layout];
    return "compact";
};
import ProfilePage from "../models/ProfilePage";
import ProfileSupportRequest, { SupportRequestStatus } from "../models/ProfileSupportRequest";
import Project from "../models/Project";

const TENANT_SRV = "http://uvc-tenant-srv:3002";
const EVENT_SRV = "http://uvc-event-srv:3008";
const SURVEY_SRV = "http://uvc-survey-srv:3007";

const FALLBACK_LIMIT = 5;

interface TenantInfo {
    _id: string;
    title: string;
    description?: string;
    integrations?: { dashboard?: boolean };
}

export const fetchTenant = async (tenantId: string): Promise<TenantInfo | undefined> => {
    try {
        const response = await NetworkAxios.get(`${TENANT_SRV}/api/tenant/public/tenant/${tenantId}`);
        return response.data as TenantInfo;
    } catch {
        return undefined;
    }
};

const fetchEvents = async (tenantId: string, ids: string[]) => {
    if (ids.length === 0) return [];
    try {
        const response = await NetworkAxios.get(`${EVENT_SRV}/api/event/network/tenant/${tenantId}/events`, { params: { ids: ids.join(",") } });
        return response.data as { _id: string }[];
    } catch {
        return [];
    }
};

const fetchSurveys = async (tenantId: string, ids: string[]) => {
    if (ids.length === 0) return [];
    try {
        const response = await NetworkAxios.get(`${SURVEY_SRV}/api/survey/network/tenant/${tenantId}/surveys`, { params: { ids: ids.join(",") } });
        return response.data as { survey: { _id: string; options: { isActive: boolean } } }[];
    } catch {
        return [];
    }
};

export const fetchSurveyResults = async (tenantId: string, surveyId: string) => {
    try {
        const response = await NetworkAxios.get(`${SURVEY_SRV}/api/survey/network/tenant/${tenantId}/survey/${surveyId}/results`);
        return response.data;
    } catch {
        throw new NotFoundError("Die Ergebnisse konnten nicht geladen werden.");
    }
};

const orderByIds = <T>(items: T[], ids: string[], getId: (item: T) => string) =>
    ids.map((id) => items.find((item) => getId(item) === id)).filter((item): item is T => item !== undefined);

const validObjectIds = (ids: string[]) => ids.filter((id) => Types.ObjectId.isValid(id));

export const getSections = (profile: ProfileDoc): ProfileSiteSection[] => {
    const allowed = new Set<string>(Object.values(ProfileSectionType));
    const stored = (profile.site?.sections ?? []).filter((section) => allowed.has(section.type));
    const sections = stored.length > 0 ? stored : defaultSiteSections();
    const missing = defaultSiteSections().filter((fallback) => !sections.some((section) => section.type === fallback.type));
    return [...sections, ...missing];
};

export const findSection = (profile: ProfileDoc, type: ProfileSectionType) =>
    getSections(profile).find((section) => section.type === type);

export const isFeatured = (profile: ProfileDoc, type: ProfileSectionType, id: string) => {
    const section = findSection(profile, type);
    return !!section?.enabled && section.featuredIds.includes(id);
};

export const findPublishedProfileBySubdomain = async (subdomain: string) => {
    const profile = await Profile.findOne({ "site.subdomain": subdomain.toLowerCase(), "site.published": true });
    if (!profile) {
        throw new NotFoundError("Diese Seite wurde nicht gefunden.");
    }
    const tenant = await fetchTenant(profile.tenantId.toString());
    if (!tenant || tenant.integrations?.dashboard === false) {
        throw new NotFoundError("Diese Seite wurde nicht gefunden.");
    }
    return { profile, tenant };
};

export const buildSitePayload = async (profile: ProfileDoc, tenant: TenantInfo | undefined) => {
    const tenantId = profile.tenantId.toString();
    const sections = getSections(profile);
    const featuredOf = (type: ProfileSectionType) =>
        validObjectIds(sections.find((section) => section.type === type)?.featuredIds ?? []);

    const boardIds = featuredOf(ProfileSectionType.BOARD);
    const eventIds = featuredOf(ProfileSectionType.EVENTS);
    const surveyIds = featuredOf(ProfileSectionType.SURVEYS);
    const supportIds = featuredOf(ProfileSectionType.SUPPORT);
    const boardEnabled = sections.find((section) => section.type === ProfileSectionType.BOARD)?.enabled !== false;

    const [boardNews, boardProjects, events, surveys, supportRequests, pagesNav] = await Promise.all([
        boardEnabled
            ? (boardIds.length > 0
                ? News.find({ _id: { $in: boardIds }, tenantId: profile.tenantId, status: ProfileObjectStatus.PUBLISHED })
                : News.find({ tenantId: profile.tenantId, status: ProfileObjectStatus.PUBLISHED }).sort({ publishDate: -1 }).limit(FALLBACK_LIMIT))
            : Promise.resolve([]),
        boardEnabled
            ? (boardIds.length > 0
                ? Project.find({ _id: { $in: boardIds }, tenantId: profile.tenantId, status: ProfileObjectStatus.PUBLISHED })
                : Project.find({ tenantId: profile.tenantId, status: ProfileObjectStatus.PUBLISHED }).sort({ publishDate: -1 }).limit(FALLBACK_LIMIT))
            : Promise.resolve([]),
        fetchEvents(tenantId, eventIds),
        fetchSurveys(tenantId, surveyIds),
        supportIds.length > 0
            ? ProfileSupportRequest.find({ _id: { $in: supportIds }, tenantId: profile.tenantId, status: SupportRequestStatus.PUBLISHED })
            : ProfileSupportRequest.find({ tenantId: profile.tenantId, status: SupportRequestStatus.PUBLISHED }).sort({ publishDate: -1 }).limit(FALLBACK_LIMIT),
        ProfilePage.find({ tenantId: profile.tenantId, status: ProfileObjectStatus.PUBLISHED }, { title: 1, slug: 1 }).sort({ title: 1 }),
    ]);

    const boardItems = [
        ...boardNews.map((item) => ({
            _id: String(item._id),
            kind: "NEWS" as const,
            title: item.title,
            content: item.content,
            image: item.image,
            publishDate: item.publishDate,
            updatedAt: item.publishDate ?? new Date(),
        })),
        ...boardProjects.map((item) => ({
            _id: String(item._id),
            kind: "PROJECT" as const,
            title: item.title,
            content: item.content,
            image: item.image,
            publishDate: item.publishDate,
            updatedAt: item.publishDate ?? new Date(),
        })),
    ];

    const board = boardIds.length > 0
        ? orderByIds(boardItems, boardIds, (item) => item._id)
        : boardItems.sort((a, b) => new Date(b.publishDate ?? b.updatedAt ?? 0).getTime() - new Date(a.publishDate ?? a.updatedAt ?? 0).getTime())
            .slice(0, FALLBACK_LIMIT);

    return {
        tenant: {
            _id: tenantId,
            title: tenant?.title ?? "",
            description: tenant?.description,
        },
        profile: {
            description: profile.description,
            contactPerson: profile.contactPerson,
            contactEmail: profile.contactEmail,
            contactPhone: profile.contactPhone,
            contactWebsite: profile.contactWebsite,
            avatarImage: profile.avatarImage,
            backgroundImage: profile.backgroundImage,
        },
        site: {
            subdomain: profile.site?.subdomain,
            published: profile.site?.published ?? false,
            logoImage: profile.site?.logoImage,
            galleryImages: profile.site?.galleryImages ?? [],
            sections: sections.map((section) => ({ type: section.type, enabled: section.enabled })),
            seoTitle: profile.site?.seoTitle,
            seoDescription: profile.site?.seoDescription,
            appearance: {
                palette: profile.site?.appearance?.palette ?? "univocal",
                layout: resolveLayout(profile.site?.appearance?.layout),
            },
            socialLinks: profile.site?.socialLinks,
            legal: profile.site?.legal,
        },
        pagesNav: pagesNav.map((page) => ({ _id: page._id, title: page.title, slug: page.slug })),
        featured: {
            board,
            events: orderByIds(events, eventIds, (event) => String(event._id)),
            surveys: orderByIds(surveys.filter((entry) => entry.survey.options.isActive), surveyIds, (entry) => String(entry.survey._id)),
            supportRequests: supportIds.length > 0
                ? orderByIds(supportRequests, supportIds, (request) => String(request._id))
                : supportRequests,
            pages: [],
        },
    };
};
