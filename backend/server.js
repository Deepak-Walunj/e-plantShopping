import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { requestContextMiddleware } from './observability/middleware.js';
import { getLogger } from './observability/logger.js';

import { PORT, ALLOWED_ORIGINS, ENV } from './core/settings.js';
import { initDependencies, shutdownDependencies } from './core/deps.js';
import { appExceptionHandler, validationExceptionHandler, genericExceptionHandler } from './middleware/errorHandler.js';

import userRoutes from './api/user.js';

const logger = getLogger('server.js');
logger.info("Initializing server script...");

export async function startServer() {
    const app = express();
    let server;
    await initDependencies()
    logger.info({ env: ENV }, 'Starting express backend');

    try {
        // ── Standard Middleware ──
        app.use(express.json());
        app.use(cookieParser());
        app.use(cors({
            origin: function (origin, callback) {
                if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            exposedHeaders: ['Set-Cookie'],
        }));

        // Request context & tracing
        app.use(requestContextMiddleware);

        // Standard Request Logging
        // app.use((req, res, next) => {
        //     logger.info({ method: req.method, url: req.url }, 'Incoming request');
        //     next();
        // });
        logger.info("MIDDLEWARE HIT");

        // ── Routes ──
        app.use('/user', userRoutes);

        app.get('/', (req, res) => {
            res.send("Hello World from e-plantShopping");
        })

        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                environment: ENV,
            });
        });

        app.get('/slow', async (req, res) => {
            await new Promise(r => setTimeout(r, 800));
            logger.info("Slow api hit")
            res.send('Slow response');
        });

        app.get('/error', (req, res, next) => {
            // In Express 5, calling next(err) is the most reliable way to hit error middleware
            next(new Error('Test error'));
        });

        app.get('/log-test', (req, res) => {
            logger.info({ test: true }, "Test log to Elasticsearch");
            res.send("logged");
        });

        // ── Error Handling (Must be defined AFTER routes) ──
        app.use(appExceptionHandler);
        app.use(validationExceptionHandler);
        app.use(genericExceptionHandler);

        // ── Start Server ──
        server = app.listen(PORT, '0.0.0.0', () => {
            logger.info({ port: PORT }, 'Server running');
        });

        // Keep-alive for ESM environments
        const keepAlive = setInterval(() => { }, 1000 * 60);

        // Graceful Shutdown
        const shutdown = async (signal) => {
            logger.info({ signal }, 'Closing server gracefully');
            clearInterval(keepAlive);

            const cleanup = async () => {
                try {
                    await shutdownDependencies();
                } catch (err) {
                    logger.error({ err }, 'Error during dependency shutdown');
                }
                logger.flush?.();
                process.exit(0);
            };

            if (server) {
                server.close(async () => {
                    logger.info('Server closed');
                    await cleanup();
                });
            } else {
                await cleanup();
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        process.on('uncaughtException', async (err) => {
            logger.error({ err }, 'Uncaught Exception');
            try {
                await shutdownDependencies();
            } catch (e) {
                logger.error({ err: e }, 'Error during dependency shutdown on uncaught exception');
            }
            logger.flush?.();
            process.exit(1);
        });

        process.on('unhandledRejection', async (err) => {
            logger.error({ err }, 'Unhandled Rejection');
            try {
                await shutdownDependencies();
            } catch (e) {
                logger.error({ err: e }, 'Error during dependency shutdown on unhandled rejection');
            }
            logger.flush?.();
            process.exit(1);
        });

        process.on('beforeExit', () => {
            logger.flush?.();
        });

    } catch (err) {
        logger.error({ err }, 'Failed to start application');
        try {
            await shutdownDependencies();
        } catch (e) {
            logger.error({ err: e }, 'Error during dependency shutdown on failed startup');
        }
        logger.flush?.();
        process.exit(1);
    }
}
