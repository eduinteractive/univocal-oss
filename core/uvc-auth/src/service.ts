import express from "express";
import { createSVHService, currentUser, errorHandler, isK8s, requireAuth, requireSVHConfig, requireTenant } from "@eduinteractive/uvc-common";
import PublicRouter from "./routes/Public";
import TenantRouter from "./routes/Tenant";
import PrivateRouter from "./routes/Private";
import AdminRouter from "./routes/Admin";
import NetworkRouter from "./routes/Network";

if (!process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD || !process.env.MONGODB_URI) {
    console.error("[Server-Information]: Missing MongoDB environment variables. Exiting...");
    process.abort();
}

const app = express();
requireSVHConfig(app);

app.use("/api/auth/admin", currentUser, requireAuth, AdminRouter);
app.use("/api/auth/public", PublicRouter);
app.use("/api/auth/tenant/:tenantId", currentUser, requireAuth, TenantRouter);
app.use("/api/auth/private", currentUser, requireAuth, PrivateRouter);
app.use("/api/auth/network", isK8s, NetworkRouter);

app.use(errorHandler);

createSVHService(app, {
    serverPort: 3001,
    database: "uvc-auth",
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    uri: process.env.MONGODB_URI,
})