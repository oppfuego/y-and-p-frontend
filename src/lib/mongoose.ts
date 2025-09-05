import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB;

if (!MONGODB_URI) throw new Error("Please add MONGODB_URI to .env.local");

type Cache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    var _mongooseCache: Cache | undefined;
}

let cached: Cache | undefined = globalThis._mongooseCache;

if (!cached) {
    cached = {conn: null, promise: null};
    globalThis._mongooseCache = cached;
}

export async function dbConnect(): Promise<typeof mongoose> {
    if (cached!.conn) return cached!.conn;

    if (!cached!.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI, {dbName: DB_NAME});
    }

    cached!.conn = await cached!.promise;
    return cached!.conn;
}
