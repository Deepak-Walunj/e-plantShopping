import { isMainThread } from 'node:worker_threads';
import { ELASTIC_APM_ENABLED } from '../core/settings.js';

if (isMainThread && ELASTIC_APM_ENABLED) {
    // Only initialize Elastic APM in the main thread.
    // This prevents Pino's worker thread (used by pino.transport) from spawning a rogue APM agent,
    // which leads to missing stdout logs and double-initialization bugs.
    await import('elastic-apm-node/start.js');
}
