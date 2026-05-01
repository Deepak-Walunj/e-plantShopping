import Joi from "joi";
import { AuthProvider, EntityType } from "../core/enum.js";

const userRegisterSchema = Joi.object({
    userType: Joi.string().valid(EntityType.USER, EntityType.DEMO_USER, EntityType.ADMIN).default(EntityType.USER),
    email: Joi.when('userType', {
        is: EntityType.DEMO_USER,
        then: Joi.forbidden(),
        otherwise: Joi.string().email().required()
    }),
    password: Joi.when('userType', {
        is: EntityType.DEMO_USER,
        then: Joi.forbidden(),
        otherwise: Joi.when('authProvider', {
            is: AuthProvider.LOCAL,
            then: Joi.string().min(6).required(),
            otherwise: Joi.forbidden()
        })
    }),
    name: Joi.when('userType', {
        is: EntityType.DEMO_USER,
        then: Joi.forbidden(),
        otherwise: Joi.string().required()
    }),
    authProvider: Joi.when('userType', {
        is: EntityType.DEMO_USER,
        then: Joi.forbidden(),
        otherwise: Joi.string().required().valid(AuthProvider.GOOGLE, AuthProvider.LOCAL)
    }),
    googleId: Joi.when('authProvider', {
        is: AuthProvider.GOOGLE,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    })
})

export {
    userRegisterSchema
}