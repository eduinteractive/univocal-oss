import { NextFunction, Request, Response } from 'express';
import PrivateMessage, { PrivateMessageDoc } from '../models/PrivateMessage';
import { Types } from 'mongoose';
import GroupMessage, { GroupMessageDoc } from '../models/GroupMessage';
import { BadRequestError, NetworkAxios, sendBrevoMail, sendPushNotification, uploadFiles } from '@eduinteractive/uvc-common';
import { SVHChatSocketService } from '../socket';
import { encrypt, decrypt } from '../utils/encryption';
import Report, { ReportStatus, ReportType } from '../models/Report';

export const getPrivateChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipientId = req.params.recipientId as string;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';

        const messages = await PrivateMessage.find({
            $or: [
                {
                    authorId: new Types.ObjectId(req.currentUser?._id),
                    recipientId: new Types.ObjectId(recipientId)
                },
                {
                    authorId: new Types.ObjectId(recipientId),
                    recipientId: new Types.ObjectId(req.currentUser?._id)
                }
            ]
        }).sort({
            creationDate: 1
        })

        // Entschlüssele den Inhalt aller Nachrichten
        const decryptedMessages = messages.map(message => ({
            ...message.toObject(),
            content: decrypt(message.content, encryptionKey)
        }));

        res.status(200).json(decryptedMessages);
    } catch (err) {
        next(err);
    }
}

export const getPrivateChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        const messages = await PrivateMessage.aggregate([
            {
                $match: {
                    $or: [
                        { authorId: new Types.ObjectId(req.currentUser?._id) },
                        { recipientId: new Types.ObjectId(req.currentUser?._id) }
                    ]
                }
            },
            {
                $sort: { creationDate: -1 }
            },
            {
                $group: {
                    _id: {
                        conversationId: {
                            $cond: {
                                if: { $lt: ["$authorId", "$recipientId"] },
                                then: { $concat: [{ $toString: "$authorId" }, { $toString: "$recipientId" }] },
                                else: { $concat: [{ $toString: "$recipientId" }, { $toString: "$authorId" }] }
                            }
                        }
                    },
                    latestMessage: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestMessage" }
            }
        ]) as PrivateMessageDoc[];
        const users = await NetworkAxios.get('http://uvc-auth-srv:3001/api/auth/network/users', {
            data: {
                userIds: messages.map((message) => req.currentUser?._id === message.authorId.toString() ? message.recipientId : message.authorId)
            }
        });
        const responseData = messages.map((message) => {
            const user = users.data.find((user: any) =>
                (user._id === message.authorId.toString() && message.recipientId.toString() === req.currentUser?._id) ||
                (user._id === message.recipientId.toString() && message.authorId.toString() === req.currentUser?._id)
            );
            const username = (user?.firstName || "") + " " + (user?.lastName || "");
            return {
                _id: message._id,
                authorId: message.authorId,
                recipientId: message.recipientId,
                authorName: username,
                content: decrypt(message.content, encryptionKey),
                creationDate: message.creationDate
            }
        })
        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const getPrivateChatUnseenCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipientId = req.params.recipientId as string;

        // Anzahl der ungelesenen Nachrichten abrufen
        const unreadCount = await PrivateMessage.countDocuments({
            authorId: new Types.ObjectId(recipientId),
            recipientId: new Types.ObjectId(req.currentUser?._id),
            seen: false
        });

        res.status(200).json({
            unreadCount
        });
    } catch (err) {
        next(err);
    }
}

export const getPrivateChatsUnseenCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Anzahl der ungelesenen Nachrichten abrufen
        const unreadCount = await PrivateMessage.countDocuments({
            recipientId: new Types.ObjectId(req.currentUser?._id),
            seen: false
        });

        res.status(200).json({
            unreadCount
        });
    } catch (err) {
        next(err);
    }
}

interface sendPrivateMessageRequest {
    content?: string;
}

export const sendPrivateMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.content && (!req.files ||!Array.isArray(req.files) || req.files.length === 0)) {
            throw new BadRequestError("Du musst entweder einen Inhalt oder eine Datei senden.");
        }
        const { recipientId } = req.params as { recipientId: string };
        const body = req.body as sendPrivateMessageRequest;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        
        // Verschlüssele den Nachrichteninhalt
        const encryptedContent = body.content ? encrypt(body.content, encryptionKey) : "";
        
        const newMessage = PrivateMessage.build({
            authorId: new Types.ObjectId(req.currentUser?._id),
            recipientId: new Types.ObjectId(recipientId as string),
            content: encryptedContent,
            creationDate: new Date(),
            seen: false,
            files: []
        });
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(`${req.currentUser?._id}_${recipientId}`, req.files);
            newMessage.files = fileData.map(file => ({
                title: file.fileName,
                link: file.url,
                mimetype: file.mimeType
            }));
        }
        await newMessage.save();
        
        // Für Socket-Broadcast und Push-Notification: Entschlüsselte Version verwenden
        const decryptedMessage = {
            ...newMessage.toObject(),
            content: body.content || ""
        };
        SVHChatSocketService.broadcastPrivateMessage(decryptedMessage as PrivateMessageDoc);
        await sendPushNotification({
            title: (req.currentUser as any).contact.first_name + " " + (req.currentUser as any).contact.last_name,
            message: body.content || "",
            userId: recipientId,
        }, req);
    } catch (err) {
        next(err);
    }
}

export const getGroupChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        const messages = await GroupMessage.aggregate([
            {
                $match: {
                    tenantId: {
                        $in: req.currentUser?.groups.map((group: any) => new Types.ObjectId(group._id as string)) || []
                    }
                }
            },
            {
                $sort: { creationDate: -1 }
            },
            {
                $group: {
                    _id: "$tenantId",
                    latestMessage: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestMessage" }
            }
        ]) as GroupMessageDoc[];
        const users = await NetworkAxios.get('http://uvc-auth-srv:3001/api/auth/network/users', {
            data: {
                userIds: messages.map((message) => message.authorId)
            }
        });
        const responseData = messages.map((message) => {
            const user = users.data.find((user: any) =>
                (user._id === message.authorId.toString())
            );
            const username = (user?.firstName || "") + " " + (user?.lastName || "");
            return {
                _id: message._id,
                authorId: message.authorId,
                tenantId: message.tenantId,
                authorName: username,
                content: decrypt(message.content, encryptionKey),
                creationDate: message.creationDate,
                seenBy: message.seenBy
            }
        })
        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
}

export const getGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.params.tenantId as string;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';

        const messages = await GroupMessage.find({
            tenantId: new Types.ObjectId(tenantId)
        }).sort({
            creationDate: 1
        })

        // Entschlüssele den Inhalt aller Nachrichten
        const decryptedMessages = messages.map(message => ({
            ...message.toObject(),
            content: decrypt(message.content, encryptionKey)
        }));

        res.status(200).json(decryptedMessages);
    } catch (err) {
        next(err);
    }
}

export const getGroupChatUnseenCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.params.tenantId as string;

        // Anzahl der ungelesenen Nachrichten abrufen
        const unreadCount = await GroupMessage.countDocuments({
            tenantId: new Types.ObjectId(tenantId),
            seenBy: { $nin: [new Types.ObjectId(req.currentUser?._id)] }
        });

        res.status(200).json({
            unreadCount
        });
    } catch (err) {
        next(err);
    }
}

interface sendGroupMessageRequest {
    content?: string;
}

export const sendGroupMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.content && (!req.files ||!Array.isArray(req.files) || req.files.length === 0)) {
            throw new BadRequestError("Du musst entweder einen Inhalt oder eine Datei senden.");
        }
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as sendGroupMessageRequest;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        
        if (!req.currentUser?.groups.find((group) => group._id as unknown as string === tenantId)) return;
        
        // Verschlüssele den Nachrichteninhalt
        const encryptedContent = body.content ? encrypt(body.content, encryptionKey) : "";
        
        const newMessage = GroupMessage.build({
            authorId: new Types.ObjectId(req.currentUser?._id as string),
            tenantId: new Types.ObjectId(tenantId as string),
            content: encryptedContent,
            creationDate: new Date(),
            seenBy: [new Types.ObjectId(req.currentUser?._id as string)],
            files: []
        });
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(`${tenantId}/chat`, req.files);
            newMessage.files = fileData.map(file => ({
                title: file.fileName,
                link: file.url,
                mimetype: file.mimeType
            }));
        }
        await newMessage.save();
        
        // Für Socket-Broadcast und Push-Notification: Entschlüsselte Version verwenden
        const decryptedMessage = {
            ...newMessage.toObject(),
            content: body.content || ""
        };
        SVHChatSocketService.broadcastGroupMessage(decryptedMessage as GroupMessageDoc, tenantId); 
        await sendPushNotification({
            title: (req.currentUser as any).contact.first_name + " " + (req.currentUser as any).contact.last_name,
            message: body.content || "",
            groupId: tenantId,
            userId: req.currentUser?._id as string,
        }, req);
    } catch (err) {
        next(err);
    }
}

interface reportPrivateMessageRequest {
    messageId: string;
    author: string;
    recipient?: string;
}

export const reportPrivateMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as reportPrivateMessageRequest;
        const messageId = body.messageId;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        const message = await PrivateMessage.findById(messageId);
        
        // Entschlüssele den Nachrichteninhalt für den Report
        const decryptedContent = message ? decrypt(message.content, encryptionKey) : '';

        const report = Report.build({
            messageId: new Types.ObjectId(messageId),
            type: ReportType.PRIVATE_MESSAGE,
            status: ReportStatus.PENDING,
        });

        await report.save();
        
        sendBrevoMail({
            to: [{ email: "support-univocal@education-interactive.de" }],
            subject: '[Univocal] Nachricht gemeldet',
            html: `
            Lieber Univocal Support,

            eine Nachricht wurde gemeldet.

            Nachricht: ${decryptedContent}

            Absender: ${body.author}

            Empfänger: ${body.recipient}

            Nachricht ID: ${messageId}

            Bitte überprüfe die Nachricht und ergreife die notwendigen Maßnahmen.

            Mit freundlichen Grüßen,

            Univocal Supportsystem
            `
        });
        res.status(200).send("Die Nachricht wurde erfolgreich gemeldet.");
    } catch (err) {
        next(err);
    }
}

interface reportGroupMessageRequest {
    messageId: string;
    author: string;
    group: string;
}

export const reportGroupMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as reportGroupMessageRequest;
        const messageId = body.messageId;
        const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
        const message = await GroupMessage.findById(messageId);
        
        // Entschlüssele den Nachrichteninhalt für den Report
        const decryptedContent = message ? decrypt(message.content, encryptionKey) : '';
        
        const report = Report.build({
            messageId: new Types.ObjectId(messageId),
            type: ReportType.GROUP_MESSAGE,
            status: ReportStatus.PENDING,
        });

        await report.save();

        sendBrevoMail({
            to: [{ email: "support-univocal@education-interactive.de" }],
            subject: '[Univocal] Nachricht gemeldet',
            html: `
            Lieber Univocal Support,

            eine Nachricht wurde gemeldet.

            Nachricht: ${decryptedContent}

            Absender: ${body.author}

            Empfängergruppe: ${body.group}

            Nachricht ID: ${messageId}

            Bitte überprüfe die Nachricht und ergreife die notwendigen Maßnahmen.

            Mit freundlichen Grüßen,

            Univocal Supportsystem
            `
        });
        res.status(200).send("Die Nachricht wurde erfolgreich gemeldet.");
    } catch (err) {
        next(err);
    }
}