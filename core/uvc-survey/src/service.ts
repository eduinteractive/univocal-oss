import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, requireAuth, requireSVHConfig, requireTenant } from "@eduinteractive/uvc-common";
import TenantRouter from "./routes/Tenant";
import PublicRouter from "./routes/Public";
import NetworkRouter from "./routes/Network";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app);

app.use("/api/survey/tenant/:tenantId", currentUser, requireAuth, requireTenant, TenantRouter);
app.use("/api/survey/public", PublicRouter);
app.use("/api/survey/network", isK8s, NetworkRouter);

app.use(errorHandler);

createSVHService(app, {
    serverPort: 3007,
    database: "uvc-survey",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
})