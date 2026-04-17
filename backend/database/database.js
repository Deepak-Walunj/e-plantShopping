import { MongoClient } from "mongodb";
import { getLogger } from '../observability/logger.js';
import { MONGODB_URI, DATABASE_NAME } from "../core/settings.js";

const logger = getLogger("database.js")

let client
let db

export async function connectDB(uri = MONGODB_URI, dbName = DATABASE_NAME) {
    if (db) return db
    client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    })
    await client.connect()
    db = client.db(dbName)
    logger.info("MongoDb Connected")
    return db
}

export function getDB() {
    if (!db) {
        throw new Error('Database not initialised')
    }
    return db
}

export async function disconnectDB() {
    if (client) {
        await client.close();
        logger.info("MongoDB disconnected");
    }
}