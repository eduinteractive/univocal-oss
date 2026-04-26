/**
 * Contact Types
 */

import { SVHMetadata } from "../base";

export interface ContactGroup extends SVHMetadata {
    _id: string;
}

export interface Contact {
    _id: string;
    contactGroupIds: string[];
    title?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    description?: string;
    street?: string;
    zip?: string;
    city?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Wiki Types
 */

export interface WikiToc {
    title: string;
    sectionId?: string;
    children?: WikiToc[];
}

export interface Wiki extends SVHMetadata {
    _id: string;
    tableOfContents: WikiToc[];
}

export interface WikiSection {
    _id: string;
    title: string;
    content?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[];
    wikiId: string;
}