import Joi from "joi";
import { AuthProvider } from "../core/enum.js";

export const userModel = Joi.object({
    email: Joi.string().email().required(),

    passwordHash: Joi.string().allow(null),

    name: Joi.string().min(2).required(),

    authProvider: Joi.string()
        .valid(AuthProvider.GOOGLE, AuthProvider.LOCAL)
        .required(),

    googleId: Joi.when('authProvider', {
        is: AuthProvider.GOOGLE,
        then: Joi.string().required(),
        otherwise: Joi.allow(null)
    }),

    isEmailVerified: Joi.boolean().default(false),

    roles: Joi.array().items(Joi.string()).default(["user"]),

    isActive: Joi.boolean().default(true),

    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
});