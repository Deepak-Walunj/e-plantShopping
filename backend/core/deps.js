import { connectDB, disconnectDB } from "../database/database.js";
import { getLogger } from "../observability/logger.js";
import { ENV, REDIS_URL } from "./settings.js";
import { initDatabase } from "../database/database_init.js";
import { createClient } from "redis";

const logger = getLogger("deps.js");

let dependency_storage = null;

class InMemoryCache {
    constructor() {
        this.store = new Map();
    }

    async get(key) {
        const val = this.store.get(key);
        return val ? JSON.parse(val) : null;
    }

    async set(key, value, ttlSeconds) {
        this.store.set(key, JSON.stringify(value));
        if (ttlSeconds) {
            setTimeout(() => this.store.delete(key), ttlSeconds * 1000);
        }
    }

    async disconnect() {
        this.store.clear();
        logger.info("InMemoryCache disconnected");
    }
}

class RedisCache {
    constructor() {
        this.client = createClient({
            url: REDIS_URL
        });

        this.client.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
        this.client.connect().then(async () => {
            logger.info("Connected to Upstash Redis successfully");
            await this.client.set('foo', 'bar'); // Test command
            const val = await this.client.get('foo');
            logger.info({ val }, "Redis test value read");
        }).catch(err => logger.error({ err }, 'Failed to connect to Redis'));
    }

    async get(key) {
        if (!this.client.isReady) return null;
        try {
            const val = await this.client.get(key);
            return val ? JSON.parse(val) : null;
        } catch (err) {
            logger.error({ err }, 'Redis GET error');
            return null;
        }
    }

    async set(key, value, ttlSeconds) {
        if (!this.client.isReady) return;
        try {
            const stringValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, stringValue);
            } else {
                await this.client.set(key, stringValue);
            }
        } catch (err) {
            logger.error({ err }, 'Redis SET error');
        }
    }

    async disconnect() {
        if (this.client.isOpen) {
            await this.client.disconnect();
            logger.info("RedisCache disconnected");
        }
    }
}

class DependencyStorage {
    constructor(db, cache) {
        if (!db) logger.error('Database not initialized');
        this._cache = cache;
        this._db = db;
    }

    getCache() {
        return this._cache;
    }

    getDB() {
        return this._db;
    }
}

export async function initDependencies() {
    if (dependency_storage) {
        return dependency_storage;
    }
    const db = await connectDB();
    await initDatabase(db); // Initialize collections and indexes

    let cache;
    if (ENV === 'development' || ENV === 'test') {
        cache = new InMemoryCache();
        logger.info("Using InMemoryCache");
    } else {
        cache = new RedisCache();
        logger.info("Using RedisCache");
    }

    dependency_storage = new DependencyStorage(db, cache);
    logger.info("Dependencies initialized");
}

export const getCache = () => {
    if (!dependency_storage) {
        throw new Error('Dependencies not initialized');
    }
    return dependency_storage.getCache();
};

export const getDependencyStorage = () => {
    if (!dependency_storage) {
        throw new Error('Dependencies not initialized');
    }
    return dependency_storage;
};

export const getDB = () => {
    if (!dependency_storage) {
        throw new Error('Dependencies not initialized');
    }
    return dependency_storage.getDB();
};

export const shutdownDependencies = async () => {
    logger.info("Shutting down dependencies...");
    if (dependency_storage) {
        const cache = dependency_storage.getCache();
        if (cache && typeof cache.disconnect === 'function') {
            await cache.disconnect();
        }
    }
    await disconnectDB();
    dependency_storage = null;
    logger.info("Dependencies shutdown complete");
};