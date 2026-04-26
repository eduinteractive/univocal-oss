import APIHandler from "./APIHandler";

export interface PrivateMessage {
    _id: string;
    authorId: string;
    recipientId: string;
    content: string;
    creationDate: Date;
    seen: boolean;
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

export interface GroupMessage {
    _id: string;
    authorId: string;
    tenantId: string;
    content: string;
    creationDate: Date;
    seenBy: string[];
    files: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

export const getPrivateChats = async () => {
    const response = await APIHandler.get('/chat/private/p2p');
    return response.data as (
        PrivateMessage & {
            authorName: string;
        })[];
}

export const getPrivateChatMessages = async (userId?: string) => {
    if (!userId) throw new Error('No User id provided');
    const response = await APIHandler.get(`/chat/private/p2p/${userId}`);
    return response.data as PrivateMessage[];
}

export const getPrivateChatUnseenCount = async (userId?: string) => {
    if (!userId) throw new Error('No User id provided');
    const response = await APIHandler.get(`/chat/private/p2p/${userId}/unseen`);
    return response.data as { unreadCount: number };
}

export const getPrivateChatsUnseenCount = async () => {
    const response = await APIHandler.get('/chat/private/p2punseen');
    return response.data as { unreadCount: number };
}


interface sendPrivateChatMessageRequest {
    recipientId: string;
    body: {
        content?: string;
        files?: File[];
    }
}

export const sendPrivateChatMessage = async (req: sendPrivateChatMessageRequest) => {
    const formData = new FormData();
    formData.append("content", req.body.content || "");
    if (req.body.files && req.body.files.length >= 1) {
        req.body.files.forEach((file) => {
            formData.append("files", file, file.name);
        })
    }
    const response = await APIHandler.post(`/chat/private/p2p/${req.recipientId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data;
}

export const getGroupChats = async () => {
    const response = await APIHandler.get('/chat/private/p2g');
    return response.data as (
        GroupMessage & {
            authorName: string;
        })[];
}

export const getGroupChatMessages = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/chat/private/p2g/${tenantId}/general`);
    return response.data as GroupMessage[];
}

export const getGroupChatUnseenCount = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/chat/private/p2g/${tenantId}/general/unseen`);
    return response.data as { unreadCount: number };
}

interface sendGroupChatMessageRequest {
    tenantId: string;
    body: {
        content?: string;
        files?: File[];
    }
}

export const sendGroupChatMessage = async (req: sendGroupChatMessageRequest) => {
    const formData = new FormData();
    formData.append("content", req.body.content || "");
    if (req.body.files && req.body.files.length >= 1) {
        req.body.files.forEach((file) => {
            formData.append("files", file, file.name);
        })
    }
    const response = await APIHandler.post(`/chat/private/p2g/${req.tenantId}/general`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data;
}


interface reportPrivateMessageRequest {
    body: {
        messageId: string;
        author: string;
        recipient: string;
    }
}

export const reportPrivateMessage = async (req: reportPrivateMessageRequest) => {
    const response = await APIHandler.post(`/chat/private/p2preport`, req.body);
    return response.data;
}

export interface reportGroupMessageRequest {
    body: {
        messageId: string;
        author: string;
        group: string;
    }
}

export const reportGroupMessage = async (req: reportGroupMessageRequest) => {
    const response = await APIHandler.post(`/chat/private/p2greport`, req.body);
    return response.data;
}