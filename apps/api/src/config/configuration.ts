/**
 * BrewLite - Configuration Loader
 * Managed by: TV1 (Tech Lead / DevOps)
 * Task 4.1: S1-08 (I-14)
 */

export default () => ({
  port: parseInt(process.env.API_PORT || process.env.PORT || '3001', 10),
  host: process.env.API_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'brewlite_user',
    password: process.env.DB_PASSWORD || 'brewlite_secure_password',
    name: process.env.DB_NAME || 'brewlite_db',
    url: process.env.DATABASE_URL,
    synchronize: false, // Production-ready: Use migrations instead
    logging: process.env.NODE_ENV === 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'brewlite_fallback_dev_secret_key_32_characters_minimum',
    expiresIn: process.env.JWT_EXPIRES_IN || '86400s',
  },
  payment: {
    mockTimeoutMs: parseInt(process.env.PAYMENT_MOCK_TIMEOUT_MS || '400', 10),
  },
});
