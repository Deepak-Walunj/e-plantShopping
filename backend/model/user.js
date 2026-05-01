import Joi from "joi";
import { AuthProvider, EntityType } from "../core/enum.js";

export const userModel = Joi.object({
    email: Joi.string()
        .email()
        .when("roles", {
            not: Joi.array().items(Joi.valid(EntityType.DEMO_USER)),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
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
    roles: Joi.array().items(Joi.string()).default([EntityType.USER]),
    isActive: Joi.boolean().default(true),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
});