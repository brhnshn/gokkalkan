import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { DashboardResponse, LocationSearchResult } from '@gokkalkan/shared';

/**
 * GÖKKALKAN — API İstemcisi & Çevrimdışı Dayanıklılık Katmanı (`client.ts`)
 * TanStack Query + localStorage persister ile internet kesildiğinde bile
 * son alınan gösterge paneli ve konum verilerini anında sunar.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Vite geliştirici sunucusunda proxy çalışıyorsa göreceli yol kullanılır
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return '';
  }
  return 'http://localhost:3001';
};

/**
 * TanStack Query Client Yapılandırması
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika taze kabul edilir
      gcTime: 1000 * 60 * 60 * 24, // 24 saat önbellekte tutulur
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

/**
 * localStorage Çevrimdışı Önbellek Kalıcılığı
 */
export const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'GOKKALKAN_QUERY_CACHE_V1',
  throttleTime: 1000,
});

/**
 * Ana Gösterge Paneli Verisini Getir (Hava, Risk, Tarım, Deniz, Deprem)
 */
export async function fetchDashboard(
  lat: number,
  lon: number,
  name?: string
): Promise<DashboardResponse> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
  });
  if (name) {
    params.set('name', name);
  }

  const endpoint = `${base}/api/v1/dashboard?${params.toString()}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gösterge paneli verisi alınamadı (HTTP ${response.status})`);
  }

  const data = (await response.json()) as DashboardResponse;
  return data;
}

/**
 * Konum Arama API Çağrısı
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const base = getApiBaseUrl();
  const endpoint = `${base}/api/v1/locations/search?q=${encodeURIComponent(query.trim())}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Konum araması başarısız oldu (HTTP ${response.status})`);
  }

  const data = (await response.json()) as { locations: LocationSearchResult[] };
  return data.locations || [];
}
