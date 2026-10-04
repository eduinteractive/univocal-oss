import { Document, Model, Schema, Types, model } from "mongoose";

export enum ProfileObjectStatus {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

export enum ProfileSectionType {
    BOARD = "BOARD",
    EVENTS = "EVENTS",
    SURVEYS = "SURVEYS",
    SUPPORT = "SUPPORT"
}

export interface ProfileSiteSection {
    type: ProfileSectionType;
    enabled: boolean;
    featuredIds: string[];
}

export const SITE_PALETTES = ["univocal", "campus-navy", "forest", "rose", "amber", "slate"] as const;
export type SitePalette = (typeof SITE_PALETTES)[number];

export const SITE_LAYOUTS = ["compact", "magazine", "showcase"] as const;
export type SiteLayoutPreset = (typeof SITE_LAYOUTS)[number];

export interface ProfileSiteAppearance {
    palette: SitePalette;
    layout: SiteLayoutPreset;
}

export interface ProfileSiteSocialLinks {
    instagram?: string;
    other?: string;
}

export const SITE_LEGAL_MODES = ["text", "link"] as const;
export type SiteLegalMode = (typeof SITE_LEGAL_MODES)[number];

export interface ProfileSiteLegalNotice {
    mode: SiteLegalMode;
    text?: string;
    url?: string;
}

export interface ProfileSiteLegal {
    privacy?: ProfileSiteLegalNotice;
    imprint?: ProfileSiteLegalNotice;
}

export interface ProfileSite {
    subdomain?: string;
    published: boolean;
    logoImage?: string;
    galleryImages: string[];
    sections: ProfileSiteSection[];
    seoTitle?: string;
    seoDescription?: string;
    appearance?: ProfileSiteAppearance;
    socialLinks?: ProfileSiteSocialLinks;
    legal?: ProfileSiteLegal;
}

export const defaultSiteSections = (): ProfileSiteSection[] => [
    { type: ProfileSectionType.BOARD, enabled: true, featuredIds: [] },
    { type: ProfileSectionType.EVENTS, enabled: true, featuredIds: [] },
    { type: ProfileSectionType.SURVEYS, enabled: true, featuredIds: [] },
    { type: ProfileSectionType.SUPPORT, enabled: true, featuredIds: [] },
];

export const defaultSite = (): ProfileSite => ({
    published: false,
    galleryImages: [],
    sections: defaultSiteSections(),
});

interface ProfileAttrs {
    tenantId: Types.ObjectId;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
    site?: ProfileSite;
}

interface ProfileModel extends Model<ProfileDoc> {
    build: (attrs: ProfileAttrs) => ProfileDoc;
}

export interface ProfileDoc extends Document {
    tenantId: Types.ObjectId;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
    site: ProfileSite;
}

const ProfileSiteSectionSchema = new Schema({
    type: { type: String, required: true, enum: Object.values(ProfileSectionType) },
    enabled: { type: Boolean, required: true, default: true },
    featuredIds: { type: [String], default: [] },
}, { _id: false });

const ProfileSiteAppearanceSchema = new Schema({
    palette: { type: String, enum: SITE_PALETTES, default: "univocal" },
    layout: { type: String, enum: SITE_LAYOUTS, default: "compact" },
}, { _id: false });

const ProfileSiteSocialLinksSchema = new Schema({
    instagram: { type: String, trim: true },
    other: { type: String, trim: true },
}, { _id: false });

const ProfileSiteLegalNoticeSchema = new Schema({
    mode: { type: String, enum: SITE_LEGAL_MODES, default: "text" },
    text: { type: String },
    url: { type: String, trim: true },
}, { _id: false });

const ProfileSiteLegalSchema = new Schema({
    privacy: { type: ProfileSiteLegalNoticeSchema },
    imprint: { type: ProfileSiteLegalNoticeSchema },
}, { _id: false });

const ProfileSiteSchema = new Schema({
    subdomain: { type: String, lowercase: true, trim: true },
    published: { type: Boolean, required: true, default: false },
    logoImage: { type: String },
    galleryImages: { type: [String], default: [] },
    sections: { type: [ProfileSiteSectionSchema], default: defaultSiteSections },
    seoTitle: { type: String },
    seoDescription: { type: String },
    appearance: { type: ProfileSiteAppearanceSchema },
    socialLinks: { type: ProfileSiteSocialLinksSchema },
    legal: { type: ProfileSiteLegalSchema },
}, { _id: false });

const ProfileSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    description: { type: String },
    contactPerson: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    contactWebsite: { type: String },
    publicPerson: { type: String },
    avatarImage: { type: String },
    backgroundImage: { type: String },
    site: { type: ProfileSiteSchema, default: defaultSite },
})

ProfileSchema.index(
    { "site.subdomain": 1 },
    { unique: true, partialFilterExpression: { "site.subdomain": { $type: "string" } } }
);

ProfileSchema.pre("validate", function () {
    const sections = this.site?.sections;
    if (!sections) return;
    const allowed = new Set<string>(Object.values(ProfileSectionType));
    for (let index = sections.length - 1; index >= 0; index--) {
        if (!allowed.has(sections[index].type)) sections.splice(index, 1);
    }
});

ProfileSchema.statics.build = (attrs: ProfileAttrs) => {
    return new Profile(attrs);
}

const Profile = model<ProfileDoc, ProfileModel>("Profile", ProfileSchema);

export default Profile;