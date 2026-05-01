import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { EMAIL_SECRET_KEY, EMAIL_TOKEN_EXPIRE_IN_MINUTES } from '../core/settings.js'
import { getLogger } from "../observability/logger.js"

const logger = getLogger("security.js")

async function hash_password(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

function verifyEmail(token) {
    logger.info(`Verifying email with token: ${token}`)
    const decode = jwt.verify(token, EMAIL_SECRET_KEY)
    logger.info(`Decoded email verification token: ${JSON.stringify(decode)}`)
    return decode
}

function generate_verification_token(data) {
    logger.info(`Generating token with data: ${JSON.stringify(data)}`)
    return jwt.sign(
        data,
        EMAIL_SECRET_KEY,
        { expiresIn: `${EMAIL_TOKEN_EXPIRE_IN_MINUTES}m` }
    )
}

export {
    hash_password,
    generate_verification_token,
    verifyEmail
}