export const RESERVED_SUBDOMAINS = new Set([
    "www",
    "apps",
    "app",
    "api",
    "admin",
    "auth",
    "login",
    "mail",
    "email",
    "smtp",
    "imap",
    "ftp",
    "monitoring",
    "status",
    "static",
    "assets",
    "cdn",
    "docs",
    "help",
    "support",
    "blog",
    "dev",
    "stage",
    "staging",
    "test",
    "univocal",
]);

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

export const normalizeSubdomain = (value: string) => value.trim().toLowerCase();

export type SubdomainValidation =
    | { valid: true }
    | { valid: false; reason: "FORMAT" | "RESERVED" };

export const validateSubdomain = (value: string): SubdomainValidation => {
    const subdomain = normalizeSubdomain(value);
    if (subdomain.length < 3 || !SUBDOMAIN_PATTERN.test(subdomain) || subdomain.includes("--")) {
        return { valid: false, reason: "FORMAT" };
    }
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
        return { valid: false, reason: "RESERVED" };
    }
    return { valid: true };
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (value: string) =>
    value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

export const isValidSlug = (value: string) => SLUG_PATTERN.test(value) && value.length <= 80;
