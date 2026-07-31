
import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = (() => {
    const _jwtSecret = process.env.JWT_SECRET;
    if (!_jwtSecret || _jwtSecret === 'your_jwt_secret_here') {
        console.warn('⚠️  WARNING: JWT_SECRET is not properly configured. Using insecure default for development only.');
    }
    return _jwtSecret || "dev-only-insecure-fallback-change-me";
})();
export const DB_PATH = process.env.DB_PATH || "movies.db";
export const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || '';
export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || '';


// Email configuration
export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || '"CineVerse" <noreply@cineverse.com>';

// Mercado Pago configuration
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
export const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY || '';
export const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL || '';
export const FRONTEND_URL = (() => {
    const url = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
})();

