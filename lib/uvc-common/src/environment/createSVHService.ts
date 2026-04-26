import { Application } from "express";
import { Server } from "http";
import mongoose from "mongoose";
import { createClient, RedisClientType } from "redis";

export const RedisClient: RedisClientType = createClient({
    url: "redis://uvc-redis-srv:6379",
})

export interface SVHServiceConfig {
    server?: Server;
    serverPort: number;
    database: string;
    user: string;
    password: string;
    uri: string;
    retryAttempts?: number;
    retryDelay?: number;
}

export const createSVHService = (app: Application, config: SVHServiceConfig, callback?: (server: Server) => void) => {
    let attempts = 0;
    const maxAttempts = config.retryAttempts || 5;
    const retryDelay = config.retryDelay || 2000;

    const connectToDatabase = async () => {
        try {
            const uri = `mongodb+srv://${config.user}:${config.password}@${config.uri}/${config.database}?tls=true&appName=mongosh+1.6.1`;
            console.log(`[Server-Information]: Connecting to MongoDB on host ${config.uri}...`);
            const mongo = await mongoose.connect(uri);
            console.log(`[Server-Information]: Connected to MongoDB on host ${mongo.connection.host}`);
            console.log(`[Server-Information]: Connecting to Redis...`);
            await RedisClient.connect();
            console.log(`[Server-Information]: Connected to Redis`);
            if (config.server) {
                const appServer = config.server.listen(config.serverPort, () => {
                    console.log(`[Server-Information]: Server started on port ${config.serverPort}`);
                    if (callback) {
                        callback(appServer);
                    }
                })
            } else {
                app.listen(config.serverPort, () => {
                    console.log(`[Server-Information]: Server started on port ${config.serverPort}`);
                })
            }
        } catch (err) {
            console.error(err);
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`[Server-Information]: Retry attempt ${attempts}/${maxAttempts}...`);
                setTimeout(connectToDatabase, retryDelay * attempts); // Exponential Backoff
            } else {
                console.error("[Server-Information]: Failed to connect to MongoDB after several attempts. Exiting...");
                process.abort();
            }
        }
    };
    
    app.get("/health", async (req, res) => {
        try {
            let dbHealth = "Database connection failed.";
            if (mongoose.connection.db) {
                await mongoose.connection.db?.admin().ping();
                dbHealth = "Database connection successful.";
            }
            if (dbHealth === "Database connection successful.") {
                res.status(200).json({ status: "OK", database: dbHealth });
            } else {
                res.status(500).json({ status: "NOT_OK", database: dbHealth });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Database connection failed.")
        }
    })

    connectToDatabase();
}

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.forEach(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await mongoose.disconnect();
            await RedisClient.quit();
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
});

signalTraps.forEach(type => {
    process.once(type, async () => {
        try {
            console.log(type);
            await mongoose.disconnect();
            await RedisClient.quit();
        } finally {
            process.kill(process.pid, type);
        }
    });
});

RedisClient.on("error", (err: Error) => {
    console.error(`[Redis-Error]: ${err}`);
});