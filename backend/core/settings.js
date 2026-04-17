import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || '5000';
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173'];
export const ENV = process.env.NODE_ENV || 'development';

export const ELASTIC_APM_ENABLED = process.env.ELASTIC_APM_ENABLED === 'true';
export const ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL;
export const ELASTIC_APM_SERVICE_NAME = process.env.ELASTIC_APM_SERVICE_NAME;
export const ELASTIC_APM_ENVIRONMENT = process.env.ELASTIC_APM_ENVIRONMENT;

export const LOG_LEVEL = process.env.LOG_LEVEL;
export const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING === 'true';
export const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING === 'true';
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH

export const MONGODB_URI = process.env.MONGODB_URI;
export const DATABASE_NAME = process.env.DATABASE_NAME;

export const REDIS_URL = process.env.REDIS_URL;

export const ELASTICSEARCH_LOGS_ENABLED = process.env.ELASTICSEARCH_LOGS_ENABLED === 'true';