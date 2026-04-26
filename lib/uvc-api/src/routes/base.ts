import axios from "axios"

const baseEnv = process.env.VITE_KUBERNETES_HOST|| process.env.NEXT_PUBLIC_KUBERNETES_HOST || process.env.KUBERNETES_HOST

export const APIHandler = axios.create({
    baseURL: baseEnv + "/api",
    withCredentials: true,
})

export interface SVHFilterObject {
    text?: string;
    sort?: Record<string, any>;
}

export const getSVHFilterParams = (params: SVHFilterObject | null) => {
    let sanitizedParams = {}
    if (params) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { label, ...sort } = params.sort ? params.sort : { label: undefined, sort: undefined };
        sanitizedParams = {
            text: params.text ? params.text : undefined,
            sort: sort
        }
    }
    return sanitizedParams;
}

export interface SVHMetadata {
    tenantId: string
    authorId: string
    title: string;
    description: string;
    viewAccess: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface createSVHMetadataAttrs {
    title: string;
    description?: string;
    viewAccess: number;
}

export interface updateSVHMetadataAttrs {
    title?: string;
    description?: string;
    viewAccess?: number;
}