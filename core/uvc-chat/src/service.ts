import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, requireAuth, requireSVHConfig } from "@eduinteractive/uvc-common";
import { createServer } from "http";
import { initializeWebSocket } from "./socket";
import PrivateRouter from "./routes/Private";
import NetworkRouter from "./routes/Network";
import AdminRouter from "./routes/Admin";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app);

app.use("/api/chat/private", currentUser, requireAuth, PrivateRouter);
app.use("/api/chat/network", isK8s, NetworkRouter);
app.use("/api/chat/admin", currentUser, requireAuth, AdminRouter);

app.use(errorHandler);

const server = createServer(app);

createSVHService(app, {
    server: server,
    serverPort: 3005,
    database: "uvc-chat",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
}, (server) => {
    initializeWebSocket(server);
})