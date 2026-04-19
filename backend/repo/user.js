import { getLogger } from "../observability/logger.js";

import { AuthProvider } from "../core/enum.js";

const logger = getLogger('user.js')

class UserRepo {
    constructor(collection) {
        this.collection = collection
    }

    async findByEmail(email) {
        logger.info({ email }, "Find by email request")
        return this.collection.findOne({ email })
    }

    async createUser(userData) {
        userData.email = userData.email.toLowerCase().trim();

        userData.createdAt = new Date();
        userData.updatedAt = new Date();

        const result = await this.collection.insertOne(userData);

        return {
            _id: result.insertedId,
            ...userData
        };
    }

    async linkGoogleAccount(userId, googleId) {
        const result = await this.collection.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    googleId,
                    authProvider: AuthProvider.GOOGLE,
                    isEmailVerified: true,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );
        return result.value || result;
    }
}

export default UserRepo