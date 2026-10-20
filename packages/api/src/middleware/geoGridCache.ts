/**
 * GÖKKALKAN — Coğrafi Grid Önbellekleme Adaptörü (`geoGridCache.ts`)
 * Enlem ve boylamı ~1.1 km hassasiyette (2 ondalık) gridler.
 * Node.js üzerinde 10 dakikalık bellek içi TTL önbelleği sunar.
 * Cloudflare Worker üzerinde ise Edge Cache (`s-maxage=600`) başlıkları uygular.
 */

import { getGeoGridKey } from '@gokkalkan/shared';
import { Context, MiddlewareHandler } from 'hono';

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export class GeoGridCacheStore {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 10 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data as T;
  }

  set<T>(cacheKey: string, data: T, ttlMs = this.defaultTtlMs): void {
    // 1000 anahtarı aştığında süresi geçmiş kayıtları temizle
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) {
          this.cache.delete(k);
        }
      }
    }

    this.cache.set(cacheKey, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs
    });
  }

  delete(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global Singleton Store (In-Memory)
export const globalGridCache = new GeoGridCacheStore(10 * 60 * 1000);

/**
 * Cloudflare Edge Cache ve HTTP istemci önbellek başlıklarını ayarlar.
 */
export function setCacheHeaders(c: Context, cacheKey: string, isHit: boolean): void {
  c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
  c.header('X-Gokkalkan-Grid', cacheKey);
  c.header('X-Cache-Status', isHit ? 'HIT' : 'MISS');
}

/**
 * Koordinatları grid anahtarına dönüştürme yardımcı fonksiyonu.
 */
export { getGeoGridKey };
