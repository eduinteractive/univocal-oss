import { Router } from "express";
import * as MessageController from "../controller/Message";
import { currentUser, downloadFile, requireAuth, requireTenant, streamImage, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { recipientChain, sendGroupMessageChain, sendPrivateMessageChain, tenantChain } from "../controller/Message.validate";

const PrivateRouter = Router({ mergeParams: true });

// P2P - Chat Routes
PrivateRouter.get("/p2punseen", currentUser, requireAuth, MessageController.getPrivateChatsUnseenCount) // Get Unseen Count
PrivateRouter.get("/p2p", currentUser, requireAuth, MessageController.getPrivateChats) // Get Chats
PrivateRouter.post("/p2preport", currentUser, requireAuth, MessageController.reportPrivateMessage) // Report Private Message
PrivateRouter.get("/p2p/:recipientId", currentUser, requireAuth, recipientChain(), validateRequestSchema, MessageController.getPrivateChat) // Get Chat
PrivateRouter.post("/p2p/:recipientId", currentUser, requireAuth, uploader.array("files", 5), sendPrivateMessageChain(), validateRequestSchema, MessageController.sendPrivateMessage)
PrivateRouter.get("/p2p/:recipientId/unseen", currentUser, requireAuth, recipientChain(), validateRequestSchema, MessageController.getPrivateChatUnseenCount) // Get Chat

// P2G - Chat Routes
PrivateRouter.get("/p2g", currentUser, requireAuth, MessageController.getGroupChats) // Get Group Chats
PrivateRouter.post("/p2greport", currentUser, requireAuth, MessageController.reportGroupMessage) // Report Group Message
PrivateRouter.get("/p2g/:tenantId/general", currentUser, requireAuth, requireTenant, tenantChain(), validateRequestSchema, MessageController.getGroupChat) // Get General Chat
PrivateRouter.post("/p2g/:tenantId/general", currentUser, requireAuth, requireTenant, uploader.array("files", 5), sendGroupMessageChain(), validateRequestSchema, MessageController.sendGroupMessage)
PrivateRouter.get("/p2g/:tenantId/general/unseen", currentUser, requireAuth, requireTenant, tenantChain(), validateRequestSchema, MessageController.getGroupChatUnseenCount) // Get Group Chat

PrivateRouter.get("/stream/:key", streamImage)
PrivateRouter.get("/download/:key", downloadFile)
export default PrivateRouter;