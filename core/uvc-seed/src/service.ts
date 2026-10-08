import express from "express";
import { runSeed } from "./seed";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
});

app.post("/api/seed", async (req, res) => {
    const expected = process.env.SEED_TOKEN;
    if (!expected) {
        res.status(503).json({ error: "SEED_TOKEN is not configured." });
        return;
    }
    if (req.header("x-seed-token") !== expected) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const result = await runSeed();
        console.log(`[uvc-seed]: Demo group ${result.subdomain} written for ${result.accounts.length} accounts.`);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err instanceof Error ? err.message : "Seed failed." });
    }
});

const port = 3012;
app.listen(port, () => {
    console.log(`[Server-Information]: Server started on port ${port}`);
});
