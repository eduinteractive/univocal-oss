export interface Profile {
    tenantId?: string;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
}

export enum PROFILE_OBJECT_STATUS {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

export interface TenantProject {
    _id?: string;
    tenantId: string;
    authorId: string;
    title: string;
    content: string;
    image?: string;
    status: PROFILE_OBJECT_STATUS;
    createdAt: Date;
    updatedAt: Date;
    publishDate?: Date;
}

export interface News {
    _id?: string;
    tenantId: string;
    authorId: string;
    title: string;
    content: string;
    image?: string;
    status: PROFILE_OBJECT_STATUS;
    createdAt: Date;
    updatedAt: Date;
    publishDate?: Date;
}