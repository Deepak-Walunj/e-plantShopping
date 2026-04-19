import express from 'express'
const router = express.Router()

import { getLogger } from '../observability/logger.js'

import { getAuthService } from '../core/deps.js'
import { ValidationError } from '../core/exception.js'

import { StandardResponse } from '../schema/utility.js'
import { userRegisterSchema } from '../schema/user.js'

const logger = getLogger('user.js')

router.post('/signup', async (req, res, next) => {
    try {
        const auth_service = await getAuthService()
        logger.info({ email: req.body?.email }, "Signup request")

        const { error, value } = userRegisterSchema.validate(req.body)
        if (error) {
            return next(new ValidationError(error.details))
        }

        const result = await auth_service.signup(value)

        res.json(new StandardResponse(true, "Signup request success", result))
    } catch (error) {
        next(error)
    }
})

export default router