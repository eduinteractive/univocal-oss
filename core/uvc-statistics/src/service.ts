import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, PERMISSION_LEVEL, requireAuth, requirePermission, requireSVHConfig } from "@eduinteractive/uvc-common";
import PublicRouter from "./routes/Public";
import AdminRouter from "./routes/Admin";
import NetworkRouter from "./routes/Network";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app);

app.use("/api/statistics/public", PublicRouter);
app.use("/api/statistics/admin", currentUser, requireAuth, requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), AdminRouter);
app.use("/api/statistics/network", isK8s, NetworkRouter);

app.use(errorHandler);

createSVHService(app, {
    serverPort: 3011,
    database: "uvc-statistics",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
})
