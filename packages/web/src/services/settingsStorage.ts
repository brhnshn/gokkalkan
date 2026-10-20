/**
 * GÖKKALKAN — Kullanıcı Ayarları ve Depolama Servisi (`settingsStorage.ts`)
 * SIFIR EMOJİ KURALI (%100): Profesyonel teknik Türkçe veri modelleri.
 */

export interface SavedLocation {
  id: string;
  name: string;
  desc: string;
  lat: number;
  lon: number;
  isDefault: boolean;
  isCoastal: boolean;
}

export interface UnitPreferences {
  tempUnit: 'C' | 'F';
  windUnit: 'kmh' | 'knot' | 'ms';
  pressureUnit: 'hPa' | 'mmHg';
}

const STORAGE_KEY_LOCATIONS = 'GOKKALKAN_SAVED_LOCATIONS_V1';
const STORAGE_KEY_UNITS = 'GOKKALKAN_USER_PREFERENCES_V1';

export const INITIAL_PRESET_LOCATIONS: SavedLocation[] = [
  {
    id: 'loc-istanbul',
    name: 'İstanbul (Kadıköy)',
    desc: 'Boğaz Hattı & Metropol İstasyonu',
    lat: 40.9819,
    lon: 29.0576,
    isDefault: true,
    isCoastal: true,
  },
  {
    id: 'loc-ankara',
    name: 'Ankara (Çankaya)',
    desc: 'İç Anadolu & Karasal İstasyon',
    lat: 39.9334,
    lon: 32.8597,
    isDefault: false,
    isCoastal: false,
  },
  {
    id: 'loc-izmir',
    name: 'İzmir (Konak)',
    desc: 'Ege Kıyı & Deniz Meteorolojisi',
    lat: 38.4237,
    lon: 27.1428,
    isDefault: false,
    isCoastal: true,
  },
  {
    id: 'loc-bursa',
    name: 'Bursa (Nilüfer)',
    desc: 'Marmara Ovası & Zirai Takip',
    lat: 40.1885,
    lon: 29.0610,
    isDefault: false,
    isCoastal: false,
  },
  {
    id: 'loc-antalya',
    name: 'Antalya (Muratpaşa)',
    desc: 'Akdeniz Sahil & Sıcaklık Radarı',
    lat: 36.8969,
    lon: 30.7133,
    isDefault: false,
    isCoastal: true,
  },
  {
    id: 'loc-canakkale',
    name: 'Çanakkale (Barbaros)',
    desc: 'Boğaz Rüzgârı & Deniz Analizi',
    lat: 40.1553,
    lon: 26.4142,
    isDefault: false,
    isCoastal: true,
  },
];

export const DEFAULT_UNITS: UnitPreferences = {
  tempUnit: 'C',
  windUnit: 'kmh',
  pressureUnit: 'hPa',
};

export const getSavedLocations = (): SavedLocation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(INITIAL_PRESET_LOCATIONS));
      return INITIAL_PRESET_LOCATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRESET_LOCATIONS;
  } catch {
    return INITIAL_PRESET_LOCATIONS;
  }
};

export const saveLocations = (locations: SavedLocation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
  } catch (err) {
    console.error('Konumlar kaydedilemedi:', err);
  }
};

export const addSavedLocation = (loc: Omit<SavedLocation, 'id' | 'isDefault'>): SavedLocation[] => {
  const current = getSavedLocations();
  const id = `loc-${Date.now()}`;
  const newLoc: SavedLocation = {
    ...loc,
    id,
    isDefault: false,
  };
  const updated = [...current, newLoc];
  saveLocations(updated);
  return updated;
};

export const removeSavedLocation = (id: string): SavedLocation[] => {
  const current = getSavedLocations();
  if (current.length <= 1) return current; // En az bir konum kalmalı
  const updated = current.filter((l) => l.id !== id);
  // Eğer silinen varsayılansa, ilkini varsayılan yap
  if (!updated.some((l) => l.isDefault)) {
    updated[0].isDefault = true;
  }
  saveLocations(updated);
  return updated;
};

export const setDefaultLocation = (id: string): SavedLocation[] => {
  const current = getSavedLocations();
  const updated = current.map((l) => ({
    ...l,
    isDefault: l.id === id,
  }));
  saveLocations(updated);
  return updated;
};

export const getUnitPreferences = (): UnitPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNITS);
    if (!raw) return DEFAULT_UNITS;
    return { ...DEFAULT_UNITS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_UNITS;
  }
};

export const saveUnitPreferences = (units: UnitPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(units));
  } catch (err) {
    console.error('Birim tercihleri kaydedilemedi:', err);
  }
};

export const calculateLocalStorageSize = (): { bytes: number; formatted: string } => {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key) || '';
      totalBytes += (key.length + val.length) * 2; // UTF-16
    }
  }
  const kb = totalBytes / 1024;
  const formatted = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  return { bytes: totalBytes, formatted };
};

export const clearAllGokkalkanCache = (): void => {
  try {
    // Sadece GOKKALKAN anahtarlarını veya tüm sorgu önbelleğini temizle
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('GOKKALKAN_') || key.startsWith('REACT_QUERY_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Önbellek temizlenemedi:', err);
  }
};
