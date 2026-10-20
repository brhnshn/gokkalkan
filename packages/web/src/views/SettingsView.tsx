import React, { useState } from 'react';
import {
  SavedLocation,
  UnitPreferences,
  getSavedLocations,
  removeSavedLocation,
  setDefaultLocation,
  getUnitPreferences,
  saveUnitPreferences,
} from '../services/settingsStorage';
import { SavedLocationsManager } from '../components/settings/SavedLocationsManager';
import { UnitPreferencesCard } from '../components/settings/UnitPreferencesCard';
import { CacheManagerCard } from '../components/settings/CacheManagerCard';
import { SystemArchitectureCard } from '../components/settings/SystemArchitectureCard';
import { SettingsIcon } from '../components/icons/SvgIcons';

interface SettingsViewProps {
  currentLocationName: string;
  onSelectLocation: (name: string, lat: number, lon: number) => void;
  onOpenSearchModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLocationName,
  onSelectLocation,
  onOpenSearchModal = () => {},
}) => {
  const [locations, setLocations] = useState<SavedLocation[]>(() => getSavedLocations());
  const [units, setUnits] = useState<UnitPreferences>(() => getUnitPreferences());

  const handleSetDefault = (id: string) => {
    const updated = setDefaultLocation(id);
    setLocations(updated);
  };

  const handleRemoveLocation = (id: string) => {
    const updated = removeSavedLocation(id);
    setLocations(updated);
  };

  const handleChangeUnits = (newUnits: UnitPreferences) => {
    setUnits(newUnits);
    saveUnitPreferences(newUnits);
  };

  return (
    <div className="space-y-4 px-4 pb-28 pt-2">
      {/* Kayıtlı İstasyon ve Konumlar */}
      <SavedLocationsManager
        locations={locations}
        currentLocationName={currentLocationName}
        onSelectLocation={onSelectLocation}
        onSetDefault={handleSetDefault}
        onRemoveLocation={handleRemoveLocation}
        onOpenSearchModal={onOpenSearchModal}
      />

      {/* Ölçüm Birimleri Seçimi */}
      <UnitPreferencesCard
        units={units}
        onChangeUnits={handleChangeUnits}
      />

      {/* Çevrimdışı Önbellek Yönetimi */}
      <CacheManagerCard />

      {/* Sistem Mimarisi & Altyapı Özeti */}
      <SystemArchitectureCard />
    </div>
  );
};
