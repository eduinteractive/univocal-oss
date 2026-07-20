import axios from "axios"
import * as SecureStore from 'expo-secure-store';
import EventEmitter from 'eventemitter3';

export const eventEmitter = new EventEmitter();

export const BASE_URL = "https://apps.univocal.de";

const APIHandler = axios.create({
    baseURL: BASE_URL + "/api",
})

APIHandler.interceptors.request.use((config) => {
    const authToken = SecureStore.getItem('authToken');
    const refreshToken = SecureStore.getItem('refreshToken');
    config.headers['x-client'] = 'uvc-mobile';
    if (authToken) {
        config.headers['authorization'] = `Bearer ${authToken}`;
    }
    if (refreshToken) {
        config.headers['x-refresh-token'] = `Bearer ${refreshToken}`;
    }
    return config;
})

APIHandler.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Emit unauthorized event instead of directly clearing storage
            eventEmitter.emit('unauthorized');
        }
        return Promise.reject(error);
    }
);

export interface UVCFilterObject {
    text?: string;
    sort?: Record<string, any>;
}

export interface UVCMetadata {
    tenantId: string
    authorId: string
    title: string;
    description: string;
    viewAccess: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface createUVCMetadataAttrs {
    title: string;
    description?: string;
    viewAccess: number;
}

export interface updateUVCMetadataAttrs {
    title?: string;
    description?: string;
    viewAccess?: number;
}

export const getUVCFilterParams = (params: UVCFilterObject | null) => {
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

export default APIHandler;