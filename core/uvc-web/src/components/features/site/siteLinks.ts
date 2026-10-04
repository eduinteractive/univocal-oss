export const externalUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

export const displayUrl = (value: string) => value.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');

/** Accepts a full URL, `instagram.com/name`, `@name` or `name`. */
export const instagramUrl = (value: string) => {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed) || /instagram\.com/i.test(trimmed)) return externalUrl(trimmed);
    return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
};

export const instagramHandle = (value: string) => {
    const match = instagramUrl(value).match(/instagram\.com\/([^/?#]+)/i);
    return match ? `@${match[1]}` : displayUrl(value);
};
