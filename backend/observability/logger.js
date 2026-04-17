import pino from "pino";
import apm from "elastic-apm-node";
import pretty from "pino-pretty"; // Import directly to avoid worker thread issues locally
import { getRequestContext } from "./requestContext.js";
import {
    LOG_LEVEL,
    ENV,
} from "../core/settings.js";

// Bypass worker-thread transports entirely in development
// The APM Native hook can sometimes block Worker Thread standard outputs on Windows
let stream;

if (ENV === "production" || ENV === "prod") {
    // In production, send completely async to Elasticsearch
    stream = pino.transport({
        target: 'pino-elasticsearch',
        level: LOG_LEVEL || 'info',
        options: {
            index: 'app-logs',
            node: 'http://localhost:9200',
            esVersion: 7, 
            flushBytes: 1000,
        }
    });
} else {
    // In development, create a fully synchronous stream to the terminal.
    // This absolutely guarantees that logs will ALWAYS print instantly regardless of APM hooks.
    stream = pretty({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: "pid,hostname",
        sync: true 
    });
}

const logger = pino(
    {
        level: LOG_LEVEL || "info",
        timestamp: pino.stdTimeFunctions.isoTime,
        mixin() {
            const ctx = getRequestContext();
            const traceIds = apm.currentTraceIds || {};

            return {
                request_id: ctx?.requestId,
                'trace.id': traceIds['trace.id'],
                'transaction.id': traceIds['transaction.id'],
                'span.id': traceIds['span.id'],
            };
        },
    },
    stream
);

export function getLogger(name) {
    return logger.child({ module: name });
}

export default logger;