import { getLogger } from "../observability/logger.js";

import { DuplicateRequestException, ValidationError, NotFoundError } from "../core/exception.js";
import { AuthProvider, EntityType } from "../core/enum.js";

import { hash_password, generate_verification_token, verifyEmail } from "../middleware/security.js";

import { userModel } from '../model/user.js';

import { sendVerificationEmail } from '../client/email.js'

const logger = getLogger('auth.js')

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async generateUniqueDemoUsername() {
        let name
        let exists = true
        while (exists) {
            const random = Math.random().toString(36).substring(2, 8)
            name = `User_${random}`
            const user = await this.userRepository.getUserByName(name)
            if (!user) exists = false
        }
        return name
    }

    async generateRandomPassword() {
        const random_password = Math.random().toString(36).substring(2, 8)
        return random_password
    }

    async signup(userData) {
        const {
            email,
            password,
            name,
            authProvider,
            googleId,
            userType
        } = userData
        if (userType !== EntityType.DEMO_USER) {
            if (!email || !name || !authProvider) {
                throw new Error("Missing required fields: email, name, authProvider");
            }
            const existingUser = await this.userRepository.findByEmail(email)
            if (existingUser) {
                if (!existingUser.isEmailVerified) {
                    await this.resendVerificationToken(existingUser.email, EntityType.USER)
                    return { message: "Verification email sent", user: existingUser, status: "PENDING_VERIFICATION" }
                }
                if (authProvider === AuthProvider.GOOGLE && existingUser.authProvider === AuthProvider.LOCAL) {
                    return await this.userRepository.linkGoogleAccount(existingUser._id, googleId)
                }
                if (authProvider === AuthProvider.LOCAL && existingUser.authProvider === AuthProvider.GOOGLE) {
                    throw new Error("Account exists with Google. Please login with Google.");
                }
                throw new DuplicateRequestException("User already exists", 409, "DUPLICATE_REQUEST", { email })
            }

            if (authProvider === AuthProvider.LOCAL) {
                if (!password) throw new Error("Password is required for local signup");
                const email_verification_token = generate_verification_token({ userType: userType, email: email, name: name })
                await sendVerificationEmail(email, email_verification_token)
                const passwordHash = await hash_password(password)
                const userPayload = {
                    email,
                    name,
                    passwordHash,
                    authProvider,
                    googleId: null,
                    isEmailVerified: false,
                    roles: [userType || EntityType.USER],
                    isActive: true
                };
                const { error, value } = userModel.validate(userPayload);
                if (error) {
                    throw new ValidationError(error.message, 400, 'VALIDATION_ERROR')
                }
                const user = await this.userRepository.createUser(value);
                return { email_verification_token: email_verification_token, message: "Verification email sent", user: user }
            } else if (authProvider === AuthProvider.GOOGLE) {
                if (!googleId) throw new Error("Google ID is required for google signup");
                const password = await this.generateRandomPassword()
                const passwordHash = await hash_password(password)
                const userPayload = {
                    email,
                    name,
                    passwordHash,
                    authProvider,
                    googleId: googleId || null,
                    isEmailVerified: authProvider === AuthProvider.GOOGLE,
                    roles: [userType || EntityType.USER],
                    isActive: true
                };
                const validatedUser = await userModel.validateAsync(userPayload);
                const user = await this.userRepository.createUser(validatedUser)
                return { user: user, message: "User created successfully" }
            }
        } else if (userType === EntityType.DEMO_USER) {
            const name = await this.generateUniqueDemoUsername()
            const password = await this.generateRandomPassword()
            const passwordHash = await hash_password(password)
            const userPayload = {
                name,
                passwordHash,
                authProvider: AuthProvider.LOCAL,
                googleId: null,
                isEmailVerified: true,
                roles: [EntityType.DEMO_USER],
                isActive: true
            };
            const validatedUser = await userModel.validateAsync(userPayload);
            const user = await this.userRepository.createUser(validatedUser)
            return { user: user, password: password, message: "Demo user created successfully" }
        }
    }

    async resendVerificationToken(email, userType) {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new Error("User not found")
        }
        if (user.isEmailVerified) {
            return { email_verification_token: null, message: "Email already verified, try to login", already_verified: true }
        }
        const email_verification_token = generate_verification_token({ userType: userType, email: email, name: user.name })
        await sendVerificationEmail(email, email_verification_token)
        return { email_verification_token: email_verification_token, message: "Verification token sent successfully", already_verified: false }
    }

    async verifyEmailByToken(token) {
        try {
            const decoded = verifyEmail(token)
            logger.info(`Decoded token after verification: ${JSON.stringify(decoded)}`)
            const user = await this.userRepository.findByEmail(decoded.email)
            if (!user) {
                throw new NotFoundError('User not found', 404, 'USER_NOT_FOUND', { email: decoded.email });
            }
            if (user.isEmailVerified) {
                logger.info("User already verified")
                return { email: decoded.email, userType: decoded.userType, already_verified: true, message: "User already verified", status: "verified" }
            }
            if (!user.roles || !user.roles.includes(decoded.userType)) {
                throw new ValidationError("Entity type missmatch", 400, 'VALIDATION_ERROR')
            }
            await this.userRepository.updateVerificationStatus(decoded.email, true)
            return { email: user.email, userType: decoded.userType, already_verified: false, message: "User verified successfully", status: "success" }
        } catch (error) {
            logger.error(error)
            throw new ValidationError(error.message, 400, 'VALIDATION_ERROR')
        }
    }
}

export default AuthService