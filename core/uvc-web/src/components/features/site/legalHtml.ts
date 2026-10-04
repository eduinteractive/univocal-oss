/** True when a TipTap document has no visible text. */
export const legalHtmlIsEmpty = (html?: string) =>
    !html?.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
