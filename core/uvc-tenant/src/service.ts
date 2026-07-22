import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, requireAuth, requireSVHConfig, requireTenant } from "@eduinteractive/uvc-common";
import PrivateRouter from "./routes/Private";
import PublicRouter from "./routes/Public";
import TenantRouter from "./routes/Tenant";
import AdminRouter from "./routes/Admin";
import NetworkRouter from "./routes/Network";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app, { S3Support: true });

app.use("/api/tenant/public", PublicRouter);
app.use("/api/tenant/tenant/:tenantId", currentUser, requireAuth, requireTenant, TenantRouter);
app.use("/api/tenant/admin", currentUser, requireAuth, AdminRouter);
app.use("/api/tenant/network", isK8s, NetworkRouter);
app.use("/api/tenant", currentUser, requireAuth, PrivateRouter);



app.use(errorHandler);

createSVHService(app, {
    serverPort: 3002,
    database: "uvc-tenant",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
})