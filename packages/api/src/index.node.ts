/**
 * GÖKKALKAN — Node.js / VDS Sunucu Giriş Noktası (`index.node.ts`)
 * `@hono/node-server` ile Linux/Windows sunucularda veya Docker konteynerinde çalışır.
 */

import { serve } from '@hono/node-server';
import { app } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST
  },
  (info) => {
    console.log(`[GÖKKALKAN API] Sunucu aktif: http://${info.address}:${info.port}`);
    console.log(`[GÖKKALKAN API] Çalışma Zamanı: Node.js (VDS / Container Modu)`);
  }
);
