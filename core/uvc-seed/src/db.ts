import mongoose, { Connection, Types } from "mongoose";

export interface SeedDoc {
    _id: Types.ObjectId;
    [key: string]: unknown;
}

export const mongoUri = (database: string) => {
    const user = process.env.MONGODB_USER;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_URI;
    if (!user || !password || !host) {
        throw new Error("Missing MongoDB environment variables.");
    }
    return `mongodb+srv://${user}:${password}@${host}/${database}?tls=true&appName=mongosh+1.6.1`;
};

export const connectDatabase = (database: string) =>
    mongoose.createConnection(mongoUri(database)).asPromise();

export const replaceDocs = async (connection: Connection, collection: string, docs: SeedDoc[]) => {
    const col = connection.collection(collection);
    await col.deleteMany({ _id: { $in: docs.map((doc) => doc._id) } });
    if (docs.length > 0) {
        await col.insertMany(docs);
    }
};

export const deleteWhere = async (
    connection: Connection,
    collection: string,
    filter: Record<string, unknown>
) => {
    await connection.collection(collection).deleteMany(filter);
};
