import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from './api/client';
import { addSavedLocation } from './services/settingsStorage';
import { AppHeader } from './components/layout/AppHeader';
import { FloatingBottomNav, NavTabId } from './components/navigation/FloatingBottomNav';
import { LocationSearchModal } from './components/modals/LocationSearchModal';
import { TodayView } from './views/TodayView';
import { MapView } from './views/MapView';
import { AlertsView } from './views/AlertsView';
import { WeekView } from './views/WeekView';
import { SettingsView } from './views/SettingsView';

interface CurrentLocationState {
  name: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY_LOCATION = 'GOKKALKAN_SELECTED_LOCATION_V1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('today');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Varsayılan Türkiye merkezi (İstanbul)
    return {
      name: 'Konum Belirleniyor...',
      lat: 41.0082,
      lon: 28.9784,
    };
  });

  // İlk açılışta kullanıcının gerçek GPS konumunu otomatik alma
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (!saved && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({
            name: 'Konumum Alınıyor...',
            lat: Number(latitude.toFixed(4)),
            lon: Number(longitude.toFixed(4)),
          });
        },
        (err) => {
          console.warn('GPS otomatik tespiti yapılamadı veya izin verilmedi:', err);
          setCurrentLocation((prev) =>
            prev.name === 'Konum Belirleniyor...'
              ? { name: 'İstanbul (Merkez)', lat: 41.0082, lon: 28.9784 }
              : prev
          );
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    }
  }, []);

  // TanStack Query ile Dashboard Verisi (localStorage önbelleği ile çevrimdışı dayanıklı)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', currentLocation.lat, currentLocation.lon],
    queryFn: () => fetchDashboard(currentLocation.lat, currentLocation.lon, currentLocation.name),
  });

  // API'den gerçek tersine coğrafi kodlama ismi geldiğinde başlığı güncelle
  useEffect(() => {
    if (data?.location?.name && (currentLocation.name.startsWith('Konum') || !currentLocation.name)) {
      const updated = {
        ...currentLocation,
        name: data.location.name,
      };
      setCurrentLocation(updated);
      try {
        localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(updated));
      } catch {}
    }
  }, [data?.location?.name]);

  // Sekme değiştiğinde sayfayı otomatik olarak en üste sıfırla
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleSelectLocation = (name: string, lat: number, lon: number) => {
    const loc = { name, lat, lon };
    setCurrentLocation(loc);
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    } catch {}
    addSavedLocation({
      name,
      desc: 'Kayıtlı İstasyon',
      lat,
      lon,
      isCoastal: true,
    });
  };

  return (
    <div className="min-h-screen bg-gok-lightBg dark:bg-gok-darkBg transition-colors duration-300">
      {/* Mobil Öncelikli iOS Çerçevesi (Masaüstünde merkezlenmiş 420px akıllı telefon kabuğu) */}
      <main className={`max-w-[420px] mx-auto min-h-screen relative flex flex-col ${activeTab === 'map' ? 'h-screen overflow-hidden' : ''}`}>
        {/* Üst Çubuk (Konum, Saat, Tema Perdelemesi, Paylaşım) */}
        <AppHeader
          locationName={currentLocation.name}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
        />

        {/* 5 Sekmenin Modüler Görünümleri */}
        <section className={`flex-1 ${activeTab === 'map' ? 'overflow-hidden h-[calc(100dvh-56px)]' : 'pb-24'}`}>
          {activeTab === 'today' && (
            <div key="today" className="animate-view-fade">
              <TodayView
                data={data}
                isLoading={isLoading}
                isError={isError}
                onRefresh={() => refetch()}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div key="map" className="animate-view-fade h-full w-full">
              <MapView
                currentLocationName={currentLocation.name}
                earthquake={data?.earthquake}
                userCoords={{ lat: currentLocation.lat, lon: currentLocation.lon }}
                onSelectLocation={handleSelectLocation}
              />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div key="alerts" className="animate-view-fade">
              <AlertsView dashboardData={data} />
            </div>
          )}

          {activeTab === 'week' && (
            <div key="week" className="animate-view-fade">
              <WeekView
                daily7={data?.daily7}
                currentTemp={data?.current.temp}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div key="settings" className="animate-view-fade">
              <SettingsView
                currentLocationName={currentLocation.name}
                onSelectLocation={handleSelectLocation}
                onOpenSearchModal={() => setIsLocationModalOpen(true)}
              />
            </div>
          )}
        </section>

        {/* Havada Yüzen iOS Liquid Glass Alt Gezinti Barı */}
        <FloatingBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Konum Arama ve İstasyon Değiştirme Modalı */}
        <LocationSearchModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSelectLocation={handleSelectLocation}
        />
      </main>
    </div>
  );
};

export default App;
