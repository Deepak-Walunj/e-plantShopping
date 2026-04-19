import { AppError } from "../core/exception.js";
import { getLogger } from "../observability/logger.js";

const logger = getLogger('errorHandler');

/**
 * Handles App-specific exceptions (4xx, 5xx with custom codes)
 */
export function appExceptionHandler(err, req, res, next) {
    if (err instanceof AppError) {
        logger.error({ err }, 'App-level exception captured');

        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error_code: err.errorCode,
            details: err.details
        });
    }
    next(err);
}

export function validationExceptionHandler(err, req, res, next) {
    // Joi Validation
    if (err.isJoi) {
        const details = err.details?.map(d => ({
            field: d.path.join('.'),
            message: d.message,
        }));

        logger.warn({ err }, 'Validation error (Joi)');

        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error_code: 'VALIDATION_ERROR',
            details,
        });
    }

    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors || {}).map(e => ({
            field: e.path,
            message: e.message,
        }));

        logger.warn({ err }, 'Database validation error');

        return res.status(400).json({
            success: false,
            message: 'Database validation error',
            error_code: 'DB_VALIDATION_ERROR',
            details,
        });
    }

    // Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            error_code: 'DUPLICATE_KEY',
        });
    }

    next(err);
}

/**
 * Final fallback for unexpected errors
 */
export function genericExceptionHandler(err, req, res, next) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the full error to stdout/ES
    logger.error({ err }, 'Unhandled exception reached fallback handler');

    const response = {
        success: false,
        message: 'Internal server error',
        error_code: 'INTERNAL_SERVER_ERROR',
    };

    if (!isProduction) {
        response.details = {
            type: err.name,
            message: err.message,
            stack: err.stack,
        };
    }

    res.status(500).json(response);
}