import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, requireAuth, requireSVHConfig, requireTenant } from "@eduinteractive/uvc-common";
import TenantRouter from "./routes/Tenant";
import NetworkRouter from "./routes/Network";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app, { S3Support: true });

app.use("/api/project/tenant/:tenantId", currentUser, requireAuth, requireTenant, TenantRouter)
app.use("/api/project/network", isK8s, NetworkRouter);

app.use(errorHandler);

createSVHService(app, {
    serverPort: 3009,
    database: "uvc-project",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
})