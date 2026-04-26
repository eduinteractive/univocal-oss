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

export enum ReportStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
}

export enum ReportType {
    PRIVATE_MESSAGE = "PRIVATE_MESSAGE",
    GROUP_MESSAGE = "GROUP_MESSAGE",
}

export enum ReportAction {
    WARNING = "WARNING",
    BAN = "BAN",
    DELETE = "DELETE",
    OTHER = "OTHER",
}

export interface SVHReport {
    _id: string;
    messageId: string;
    type: ReportType;
    status: ReportStatus;
    action?: ReportAction;
    reason?: string;
    originalMessageContent?: string;
    message?: string; // Decrypted message content from getReport (or placeholder if overwritten)
    createdAt?: Date;
    updatedAt?: Date;
}