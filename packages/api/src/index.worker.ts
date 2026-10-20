/**
 * GÖKKALKAN — Cloudflare Workers Giriş Noktası (`index.worker.ts`)
 * Cloudflare Edge ağında sıfır soğuk başlangıç (zero cold-start) ile çalışır.
 */

import { app } from './app.js';

export default app;
