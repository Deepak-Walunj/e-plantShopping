import bcrypt from 'bcrypt'

import { getLogger } from "../observability/logger.js";

import { DuplicateRequestException } from "../core/exception.js";

import { AuthProvider } from "../core/enum.js";

import { userModel } from '../model/user.js';

const logger = getLogger('auth.js')

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async signup(userData) {
        const {
            email,
            password,
            name,
            authProvider,
            googleId
        } = userData

        logger.info({ email, authProvider }, "Signup request")

        if (!email || !name || !authProvider) {
            throw new Error("Missing required fields: email, name, authProvider");
        }

        const existingUser = await this.userRepository.findByEmail(email)
        if (existingUser) {
            if (authProvider === AuthProvider.GOOGLE && existingUser.authProvider === AuthProvider.LOCAL) {
                return await this.userRepository.linkGoogleAccount(
                    existingUser._id, googleId
                )
            }
            if (
                authProvider === AuthProvider.LOCAL &&
                existingUser.authProvider === AuthProvider.GOOGLE
            ) {
                throw new Error("Account exists with Google. Please login with Google.");
            }
            throw new DuplicateRequestException("User already exists", 409, "DUPLICATE_REQUEST", { email })
        }

        let passwordHash = null
        if (authProvider === AuthProvider.LOCAL) {
            if (!password) throw new Error("Password is required for local signup");
            passwordHash = await bcrypt.hash(password, 10)
        } else if (authProvider === AuthProvider.GOOGLE) {
            if (!googleId) throw new Error("Google ID is required for google signup");
        }

        const userPayload = {
            email,
            name,
            passwordHash,
            authProvider,
            googleId: googleId || null,
            isEmailVerified: authProvider === AuthProvider.GOOGLE,
            roles: ["user"],
            isActive: true
        };
        const validatedUser = await userModel.validateAsync(userPayload);
        return this.userRepository.createUser(validatedUser)
    }
}

export default AuthService