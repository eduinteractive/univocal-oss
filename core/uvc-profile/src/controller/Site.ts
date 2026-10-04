import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { APIError, BadRequestError, uploadFile } from "@eduinteractive/uvc-common";
import Profile, {
    defaultSite,
    ProfileDoc,
    ProfileSectionType,
    ProfileSiteAppearance,
    ProfileSiteLegal,
    ProfileSiteLegalNotice,
    ProfileSiteSection,
    ProfileSiteSocialLinks,
    SiteLegalMode,
} from "../models/Profile";
import { normalizeSubdomain, validateSubdomain } from "../utils/Subdomain";
import { buildSitePayload, fetchTenant, getSections } from "../services/SiteResolver";

const MAX_GALLERY_IMAGES = 12;
const MAX_FEATURED_PER_SECTION = 12;

class ConflictError extends APIError {
    constructor(message: string) {
        super("ConflictError", message, 409, true);
    }
}

const findOrCreateProfile = async (tenantId: string) => {
    const existing = await Profile.findOne({ tenantId: new Types.ObjectId(tenantId) });
    if (existing) {
        if (!existing.site) {
            existing.site = defaultSite();
        }
        return existing;
    }
    const profile = Profile.build({ tenantId: new Types.ObjectId(tenantId), site: defaultSite() });
    await profile.save();
    return profile;
};

const serializeSite = (profile: ProfileDoc) => ({
    ...profile.toObject().site,
    sections: getSections(profile),
});

const legalHtmlIsEmpty = (html: string) => !html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

const cleanLegalNotice = (notice?: Partial<ProfileSiteLegalNotice>): ProfileSiteLegalNotice | undefined => {
    if (!notice) return undefined;
    const mode: SiteLegalMode = notice.mode === "link" ? "link" : "text";
    const text = notice.text && !legalHtmlIsEmpty(notice.text) ? notice.text.trim() : undefined;
    const url = notice.url?.trim() || undefined;
    if (!text && !url) return undefined;
    return { mode, text, url };
};

const isSubdomainTaken = async (subdomain: string, tenantId: string) =>
    !!(await Profile.exists({ "site.subdomain": subdomain, tenantId: { $ne: new Types.ObjectId(tenantId) } }));

export const getSite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const profile = await findOrCreateProfile(tenantId);
        res.status(200).json(serializeSite(profile));
    } catch (err) {
        next(err);
    }
}

export const getSitePreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const profile = await findOrCreateProfile(tenantId);
        const tenant = await fetchTenant(tenantId);
        res.status(200).json(await buildSitePayload(profile, tenant));
    } catch (err) {
        next(err);
    }
}

interface updateSiteRequest {
    published?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    galleryImages?: string[];
    logoImage?: string;
    sections?: ProfileSiteSection[];
    appearance?: Partial<ProfileSiteAppearance>;
    socialLinks?: ProfileSiteSocialLinks;
    legal?: ProfileSiteLegal;
}

export const updateSite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as updateSiteRequest;
        const profile = await findOrCreateProfile(tenantId);

        if (body.published === true && !profile.site.subdomain) {
            throw new BadRequestError("Lege zuerst eine Subdomain fest, bevor du die Seite veröffentlichst.");
        }
        if (body.published !== undefined) profile.site.published = body.published;
        if (body.seoTitle !== undefined) profile.site.seoTitle = body.seoTitle;
        if (body.seoDescription !== undefined) profile.site.seoDescription = body.seoDescription;
        if (body.logoImage === "") profile.site.logoImage = undefined;

        if (body.appearance !== undefined) {
            profile.site.appearance = {
                palette: body.appearance.palette ?? profile.site.appearance?.palette ?? "univocal",
                layout: body.appearance.layout ?? profile.site.appearance?.layout ?? "compact",
            };
        }

        if (body.socialLinks !== undefined) {
            const instagram = body.socialLinks.instagram?.trim() || undefined;
            const other = body.socialLinks.other?.trim() || undefined;
            profile.site.socialLinks = instagram || other ? { instagram, other } : undefined;
        }

        if (body.legal !== undefined) {
            const privacy = cleanLegalNotice(body.legal.privacy);
            const imprint = cleanLegalNotice(body.legal.imprint);
            profile.site.legal = privacy || imprint ? { privacy, imprint } : undefined;
        }

        if (body.galleryImages !== undefined) {
            // Only allow reordering/removing images that already belong to the site.
            const current = new Set(profile.site.galleryImages);
            profile.site.galleryImages = body.galleryImages.filter((image) => current.has(image));
        }

        if (body.sections !== undefined) {
            const seen = new Set<ProfileSectionType>();
            const sections: ProfileSiteSection[] = [];
            for (const section of body.sections) {
                if (!Object.values(ProfileSectionType).includes(section.type) || seen.has(section.type)) continue;
                seen.add(section.type);
                sections.push({
                    type: section.type,
                    enabled: section.enabled !== false,
                    featuredIds: [...new Set((section.featuredIds ?? []).filter((id) => Types.ObjectId.isValid(id)))].slice(0, MAX_FEATURED_PER_SECTION),
                });
            }
            profile.site.sections = sections;
        }

        profile.markModified("site");
        await profile.save();
        res.status(200).json(serializeSite(profile));
    } catch (err) {
        next(err);
    }
}

export const checkSubdomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const subdomain = normalizeSubdomain(String(req.query.subdomain ?? ""));
        const validation = validateSubdomain(subdomain);
        if (!validation.valid) {
            res.status(200).json({ subdomain, available: false, reason: validation.reason });
            return;
        }
        const taken = await isSubdomainTaken(subdomain, tenantId);
        res.status(200).json({ subdomain, available: !taken, reason: taken ? "TAKEN" : undefined });
    } catch (err) {
        next(err);
    }
}

export const updateSubdomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const { subdomain: rawSubdomain } = req.body as { subdomain?: string | null };
        const profile = await findOrCreateProfile(tenantId);

        if (profile.site.subdomain) {
            throw new BadRequestError("Die Subdomain ist festgelegt. Für eine Änderung wende dich an den Univocal-Support.");
        }

        if (!rawSubdomain) {
            profile.site.subdomain = undefined;
            profile.site.published = false;
        } else {
            const subdomain = normalizeSubdomain(rawSubdomain);
            const validation = validateSubdomain(subdomain);
            if (!validation.valid) {
                throw new BadRequestError(validation.reason === "RESERVED"
                    ? "Diese Subdomain ist reserviert."
                    : "Die Subdomain darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten (3–63 Zeichen).");
            }
            if (await isSubdomainTaken(subdomain, tenantId)) {
                throw new ConflictError("Diese Subdomain ist bereits vergeben.");
            }
            profile.site.subdomain = subdomain;
        }

        profile.markModified("site");
        try {
            await profile.save();
        } catch (err) {
            if ((err as { code?: number }).code === 11000) {
                throw new ConflictError("Diese Subdomain ist bereits vergeben.");
            }
            throw err;
        }
        res.status(200).json(serializeSite(profile));
    } catch (err) {
        next(err);
    }
}

export const updateLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        if (!req.file) {
            throw new BadRequestError("Es wurde keine Datei hochgeladen.");
        }
        const profile = await findOrCreateProfile(tenantId);
        const fileExtension = req.file.originalname.split(".").pop();
        profile.site.logoImage = await uploadFile(`${tenantId}/site/logo-${Date.now()}.${fileExtension}`, req.file);
        profile.markModified("site");
        await profile.save();
        res.status(200).json(serializeSite(profile));
    } catch (err) {
        next(err);
    }
}

export const addGalleryImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        if (files.length === 0) {
            throw new BadRequestError("Es wurden keine Dateien hochgeladen.");
        }
        const profile = await findOrCreateProfile(tenantId);
        if (profile.site.galleryImages.length + files.length > MAX_GALLERY_IMAGES) {
            throw new BadRequestError(`Es sind maximal ${MAX_GALLERY_IMAGES} Bilder in der Galerie erlaubt.`);
        }
        for (const file of files) {
            const fileExtension = file.originalname.split(".").pop();
            const location = await uploadFile(`${tenantId}/site/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExtension}`, file);
            profile.site.galleryImages.push(location);
        }
        profile.markModified("site");
        await profile.save();
        res.status(200).json(serializeSite(profile));
    } catch (err) {
        next(err);
    }
}
