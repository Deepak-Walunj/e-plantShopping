import Joi from "joi";
import { AuthProvider } from "../core/enum.js";

const userRegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.when('authProvider', {
        is: AuthProvider.LOCAL,
        then: Joi.string().min(6).required(),
        otherwise: Joi.forbidden()
    }),
    name: Joi.string().required(),
    authProvider: Joi.string().required().valid(AuthProvider.GOOGLE, AuthProvider.LOCAL),
    googleId: Joi.when('authProvider', {
        is: AuthProvider.GOOGLE,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
})

export {
    userRegisterSchema
}