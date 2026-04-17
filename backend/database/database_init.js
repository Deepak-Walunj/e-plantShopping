import { COLLECTIONS } from "./collection.js";
import { getLogger } from "../observability/logger.js";

const logger = getLogger('database_init');

export async function initDatabase(db) {
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    for (const name of Object.values(COLLECTIONS)) {
        if (!existingNames.includes(name)) {
            await db.createCollection(name);
            logger.info({ collection: name }, "Collection created");
        }
    }

    await db.collection(COLLECTIONS.USERS).createIndex(
        { email: 1 },
        { unique: true }
    )

    await db.collection(COLLECTIONS.ADMINS).createIndex(
        { email: 1 },
        { unique: true }
    )
}
