import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define MONGO_URI in .env.local");
}

// Define type for caches connection
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

//Extend global type
declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;