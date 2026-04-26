import { sendPushNotification, UserPayload } from "@eduinteractive/uvc-common";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Request } from "express";
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Types } from "mongoose";
import PrivateMessage from "./models/PrivateMessage";
import GroupMessage from "./models/GroupMessage";
import { PrivateMessageDoc } from "./models/PrivateMessage";
import { GroupMessageDoc } from "./models/GroupMessage";
import { encrypt } from "./utils/encryption";

declare module 'socket.io' {
    interface Socket {
        currentUser?: UserPayload;
    }
}

interface NewPrivateMessage {
    recipientId: string;
    content: string;
}

interface NewGroupMessage {
    tenantId: string;
    content: string;
}

export class SVHChatSocket {
    private io: SocketIOServer;
    private userConnections: { [key: string]: { socketId: string, user: UserPayload } } = {};

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            path: '/api/chat/socket.io',
            cors: {
                origin: process.env.PUBLIC_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.use((socket, next) => {
            let token = null;
            if (socket.handshake.headers.cookie) {
                const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
                token = parsedCookies.token;
            } else {
                token = socket.handshake.auth?.token;
            }
            if (token) {
                try {
                    const payload = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY!) as UserPayload;
                    socket.currentUser = payload;
                    return next();
                } catch (err) {
                    return next(new Error('Authentication error: Invalid token'));
                }
            }
            return next(new Error('Authentication error: Token not provided'));
        });

        this.io.on('connection', (socket) => {

            this.userConnections[socket.currentUser?._id as string] =
            {
                socketId: socket.id,
                user: socket.currentUser as UserPayload
            };

            socket.on('sendP2PMessage', async (data: NewPrivateMessage) => {
                try {
                    const recipientSocketId = this.userConnections[data.recipientId]?.socketId;
                    if (data.content === '') return;
                    const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
                    
                    // Verschlüssele den Nachrichteninhalt
                    const encryptedContent = encrypt(data.content, encryptionKey);
                    
                    const newMessage = PrivateMessage.build({
                        authorId: new Types.ObjectId(socket.currentUser?._id as string),
                        recipientId: new Types.ObjectId(data.recipientId as string),
                        content: encryptedContent,
                        creationDate: new Date(),
                        seen: false,
                        files: []
                    });
                    await newMessage.save();
                    
                    // Für Broadcast: Entschlüsselte Version verwenden
                    const decryptedMessage = {
                        ...newMessage.toObject(),
                        content: data.content
                    };
                    this.broadcastPrivateMessage(decryptedMessage as PrivateMessageDoc);
                    await sendPushNotification({
                        title: (socket.currentUser as any).contact.first_name + " " + (socket.currentUser as any).contact.last_name,
                        message: data.content,
                        userId: data.recipientId,
                    }, {
                        headers: {
                            'cookie': socket.handshake.headers.cookie,
                            'authorization': socket.handshake.headers.authorization
                        }
                    } as unknown as Request);
                } catch (err) {
                    console.error(err);
                }
            })

            socket.on('sendP2GMessage', async (data: NewGroupMessage) => {
                try {
                    if (data.content === '') return;
                    if (!socket.currentUser?.groups.find((group) => group._id as unknown as string === data.tenantId)) return;
                    const encryptionKey = process.env.NETWORK_KEY || process.env.JWT_ENCRYPTION_KEY || '';
                    
                    // Verschlüssele den Nachrichteninhalt
                    const encryptedContent = encrypt(data.content, encryptionKey);
                    
                    const newMessage = GroupMessage.build({
                        authorId: new Types.ObjectId(socket.currentUser?._id as string),
                        tenantId: new Types.ObjectId(data.tenantId as string),
                        content: encryptedContent,
                        creationDate: new Date(),
                        seenBy: [new Types.ObjectId(socket.currentUser?._id as string)],
                        files: []
                    });
                    await newMessage.save();
                    
                    // Für Broadcast: Entschlüsselte Version verwenden
                    const decryptedMessage = {
                        ...newMessage.toObject(),
                        content: data.content
                    };
                    const recipientIds = Object.entries(this.userConnections)
                        .filter(([userId, user]) =>
                            user.user.groups
                                .find((group: any) => group._id as unknown as string === data.tenantId)
                        )
                        .map(([userId, user]) => user.socketId);
                    this.io.to(recipientIds).emit('newGroupMessage', decryptedMessage);
                    await sendPushNotification({
                        title: (socket.currentUser as any).contact.first_name + " " + (socket.currentUser as any).contact.last_name,
                        message: data.content,
                        groupId: data.tenantId,
                        userId: socket.currentUser?._id as string,
                    }, {
                        headers: {
                            'cookie': socket.handshake.headers.cookie,
                            'authorization': socket.handshake.headers.authorization
                        }
                    } as unknown as Request);
                } catch (err) {
                    console.error(err);
                }
            })

            socket.on('markGAsSeen', async (tenantId: string) => {
                const message = await GroupMessage.find({ tenantId: tenantId, seenBy: { $nin: [new Types.ObjectId(socket.currentUser?._id as string)] } });
                message.forEach(async (msg) => {
                    msg.seenBy.push(new Types.ObjectId(socket.currentUser?._id as string));
                    await msg.save();
                });
                // Send to currentUser only a success
                this.io.to(socket.id).emit('markedGAsSeen', tenantId);
            });

            socket.on('markPAsSeen', async (authorId: string) => {
                const message = await PrivateMessage.find({ authorId: authorId, recipientId: new Types.ObjectId(socket.currentUser?._id as string), seen: false });
                message.forEach(async (msg) => {
                    msg.seen = true;
                    await msg.save();
                });
                // Send to currentUser only a success
                this.io.to(socket.id).emit('markedPAsSeen', authorId);
            })


            socket.on('disconnect', () => {
                for (const [userId, user] of Object.entries(this.userConnections)) {
                    if (user.socketId === socket.id) {
                        delete this.userConnections[userId];
                        break;
                    }
                }
            })
        });
    }

    public broadcastPrivateMessage(message: PrivateMessageDoc) {
        if (this.userConnections[message.recipientId.toString()]) {
            console.log('Sending private message to recipient', this.userConnections[message.recipientId.toString()].socketId);
            this.io.to(this.userConnections[message.recipientId.toString()].socketId).emit('newPrivateMessage', message);
        }
        if (this.userConnections[message.authorId.toString()]) {
            console.log('Sending private message to author', this.userConnections[message.authorId.toString()].socketId);
            this.io.to(this.userConnections[message.authorId.toString()].socketId).emit('newPrivateMessage', message);
        }
    }

    public broadcastGroupMessage(message: GroupMessageDoc, tenantId: string) {
        const recipientIds = Object.entries(this.userConnections)
            .filter(([userId, user]) =>
                user.user.groups
                    .find((group: any) => group._id as unknown as string === tenantId)
            )
            .map(([userId, user]) => user.socketId);

        this.io.to(recipientIds).emit('newGroupMessage', message);

    }
}

export let SVHChatSocketService: SVHChatSocket;

export const initializeWebSocket = (server: HTTPServer) => {
    SVHChatSocketService = new SVHChatSocket(server);
    return SVHChatSocket;
};