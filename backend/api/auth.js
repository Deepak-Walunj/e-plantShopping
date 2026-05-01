import express from 'express'
const router = express.Router()

import { getLogger } from '../observability/logger.js'

import { getAuthService } from '../core/deps.js'
import { ValidationError, MissingRequiredFields } from '../core/exception.js'

import { StandardResponse } from '../schema/utility.js'

const logger = getLogger('auth.js')

router.get("/verify-email", async (req, res, next) => {
    try {
        const authService = await getAuthService()
        const { token } = req.query
        if (!token) {
            return next(new MissingRequiredFields("Verification token is required", 400, 'MISSING_FIELDS', [{ message: "Verification token is required", field: "token" }]));
        }
        const resp = await authService.verifyEmailByToken(token)
        return res.json(new StandardResponse(true, resp.message, { email: resp.email, userType: resp.userType, is_verified: resp.already_verified, status: resp.status }))
    } catch (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', { error: error.details }))
    }
})

router.post("/resend-verification", async (req, res, next) => {
    try {
        const authService = await getAuthService()
        const { email, userType } = req.body
        if (!email) {
            return next(new MissingRequiredFields("Email is required", 400, 'MISSING_FIELDS', [{ message: "Email is required", field: "email" }]));
        }
        if (!userType) {
            return next(new MissingRequiredFields("userType is required", 400, 'MISSING_FIELDS', [{ message: "userType is required", field: "userType" }]));
        }
        const resp = await authService.resendVerificationToken(email, userType)
        return res.json(new StandardResponse(true, resp.message, { already_verified: resp.already_verified }))
    } catch (error) {
        return next(new ValidationError(error.message, 400, 'VALIDATION_ERROR', { error: error.details }))
    }
})

export default router