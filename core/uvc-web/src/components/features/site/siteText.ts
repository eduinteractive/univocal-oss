export const htmlToText = (html?: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

export const truncate = (text: string, length: number) =>
    text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

export const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/ß/g, 'ss')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
