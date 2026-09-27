import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This file compiles to server/dist/config/index.js, so __dirname there is
// server/dist/config. Three levels up (config → dist → server →) reaches the
// project root, where client/dist and the default sqlite file live. These
// fallbacks only matter if DB_PATH/CLIENT_DIST_PATH aren't set in .env.
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');

export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const DB_PATH = process.env.DB_PATH || path.join(PROJECT_ROOT, 'seafood_qms.db');
export const CLIENT_DIST_PATH =
  process.env.CLIENT_DIST_PATH || path.join(PROJECT_ROOT, 'client', 'dist');
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const NODE_ENV = process.env.NODE_ENV || 'development';
