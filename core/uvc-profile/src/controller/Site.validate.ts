import { body, check, query } from "express-validator";
import { ProfileObjectStatus, SITE_LAYOUTS, SITE_LEGAL_MODES, SITE_PALETTES } from "../models/Profile";
import { SupportRequestStatus } from "../models/ProfileSupportRequest";
import { SupportResponseKind, SupportResponseStatus } from "../models/ProfileSupportResponse";

export const updateSiteChain = () => [
    body("published").optional().isBoolean().withMessage("Published must be a boolean"),
    body("seoTitle").optional().isString().isLength({ max: 120 }).withMessage("SEO title must be a string (max 120)"),
    body("seoDescription").optional().isString().isLength({ max: 300 }).withMessage("SEO description must be a string (max 300)"),
    body("logoImage").optional().isString().withMessage("Logo image must be a string"),
    body("galleryImages").optional().isArray().withMessage("Gallery images must be an array"),
    body("galleryImages.*").optional().isString().withMessage("Gallery image must be a string"),
    body("sections").optional().isArray().withMessage("Sections must be an array"),
    body("sections.*.featuredIds").optional().isArray().withMessage("Featured ids must be an array"),
    body("appearance").optional().isObject().withMessage("Appearance must be an object"),
    body("appearance.palette").optional().isIn(SITE_PALETTES).withMessage("Invalid palette"),
    body("appearance.layout").optional().isIn(SITE_LAYOUTS).withMessage("Invalid layout"),
    body("socialLinks").optional().isObject().withMessage("Social links must be an object"),
    body("socialLinks.instagram").optional().isString().trim()
        .matches(/^$|^@?[A-Za-z0-9._]{1,30}$|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?$/i)
        .withMessage("Bitte gib einen Instagram-Namen (z. B. @fachschaft) oder einen Instagram-Link an."),
    body("socialLinks.other").optional().isString().trim().isLength({ max: 300 })
        .matches(/^$|^(https?:\/\/)?[^\s/:?#]+\.[^\s/:?#]+(\/\S*)?$/i)
        .withMessage("Bitte gib einen gültigen Link an (z. B. discord.gg/... oder https://...)."),
    body("legal").optional().isObject().withMessage("Legal notices must be an object"),
    ...legalNoticeChain("privacy"),
    ...legalNoticeChain("imprint"),
];

const legalNoticeChain = (key: "privacy" | "imprint") => [
    body(`legal.${key}`).optional().isObject().withMessage("Legal notice must be an object"),
    body(`legal.${key}.mode`).optional().isIn(SITE_LEGAL_MODES).withMessage("Invalid legal notice mode"),
    body(`legal.${key}.text`).optional().isString().isLength({ max: 100000 }).withMessage("Legal text is too long (max 100000)"),
    body(`legal.${key}.url`).optional().isString().trim().isLength({ max: 300 })
        .matches(/^$|^(https?:\/\/)?[^\s/:?#]+\.[^\s/:?#]+(\/\S*)?$/i)
        .withMessage("Bitte gib einen gültigen Link an."),
];

export const checkSubdomainChain = () => [
    query("subdomain").isString().withMessage("Subdomain must be a string"),
];

export const updateSubdomainChain = () => [
    body("subdomain").optional({ values: "null" }).isString().withMessage("Subdomain must be a string"),
];

export const createPageChain = () => [
    body("title").isString().trim().notEmpty().isLength({ max: 160 }).withMessage("Title is required (max 160)"),
    body("slug").optional().isString().withMessage("Slug must be a string"),
    body("content").optional().isString().withMessage("Content must be a string"),
    body("status").optional().isIn(Object.values(ProfileObjectStatus)).withMessage("Invalid status"),
];

export const pageIdChain = () => [
    check("pageId").isMongoId().withMessage("Page ID must be a valid Mongo ID"),
];

export const updatePageChain = () => [
    ...pageIdChain(),
    body("title").optional().isString().trim().notEmpty().isLength({ max: 160 }).withMessage("Title must be a string (max 160)"),
    body("slug").optional().isString().withMessage("Slug must be a string"),
    body("content").optional().isString().withMessage("Content must be a string"),
    body("status").optional().isIn(Object.values(ProfileObjectStatus)).withMessage("Invalid status"),
];

export const createSupportRequestChain = () => [
    body("title").isString().trim().notEmpty().isLength({ max: 160 }).withMessage("Title is required (max 160)"),
    body("description").optional().isString().isLength({ max: 5000 }).withMessage("Description must be a string (max 5000)"),
    body("status").optional().isIn(Object.values(SupportRequestStatus)).withMessage("Invalid status"),
];

export const requestIdChain = () => [
    check("requestId").isMongoId().withMessage("Request ID must be a valid Mongo ID"),
];

export const updateSupportRequestChain = () => [
    ...requestIdChain(),
    body("title").optional().isString().trim().notEmpty().isLength({ max: 160 }).withMessage("Title must be a string (max 160)"),
    body("description").optional().isString().isLength({ max: 5000 }).withMessage("Description must be a string (max 5000)"),
    body("status").optional().isIn(Object.values(SupportRequestStatus)).withMessage("Invalid status"),
];

export const responseIdChain = () => [
    check("responseId").isMongoId().withMessage("Response ID must be a valid Mongo ID"),
];

export const updateSupportResponseChain = () => [
    ...responseIdChain(),
    body("status").isIn(Object.values(SupportResponseStatus)).withMessage("Invalid status"),
];

export const subdomainParamChain = () => [
    check("subdomain").isString().isLength({ min: 1, max: 63 }).withMessage("Invalid subdomain"),
];

export const publicPageChain = () => [
    ...subdomainParamChain(),
    check("slug").isString().isLength({ min: 1, max: 80 }).withMessage("Invalid slug"),
];

export const publicSupportRequestChain = () => [
    ...subdomainParamChain(),
    ...requestIdChain(),
];

export const createPublicSupportResponseChain = () => [
    ...publicSupportRequestChain(),
    body("kind").isIn(Object.values(SupportResponseKind)).withMessage("Invalid kind"),
    body("name").optional().isString().isLength({ max: 120 }).withMessage("Name must be a string (max 120)"),
    body("email").isEmail().isLength({ max: 254 }).withMessage("Bitte gib eine gültige E-Mail-Adresse an."),
    body("message").isString().trim().isLength({ min: 3, max: 3000 }).withMessage("Bitte gib eine Nachricht ein (3–3000 Zeichen)."),
    body("website").optional().isString(),
];

export const publicSurveyResultsChain = () => [
    ...subdomainParamChain(),
    check("surveyId").isMongoId().withMessage("Survey ID must be a valid Mongo ID"),
];
