import React, { useState, useCallback } from 'react';
import { Shop, LanguageCode } from '../types';
import { searchShopsByWasteType } from '../services/geminiService';
import Spinner from './Spinner';
import ShopCard from './ShopCard';
import { SearchIcon, LocationMarkerIcon } from './icons';

interface FindShopsPageProps {
  updateEcoScore: (points: number) => void;
  t: (key: string) => string;
  language: LanguageCode;
}

const FindShopsPage: React.FC<FindShopsPageProps> = ({ updateEcoScore, t, language }) => {
  const [wasteType, setWasteType] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleGetLocation = useCallback(() => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocationError(t('location_error_enable'));
        }
      );
    } else {
      setLocationError(t('location_error_unsupported'));
    }
  }, [t]);

  const handleSearch = async () => {
    if (!wasteType.trim()) {
      setError(t('find_shops_error_enter_waste'));
      return;
    }
    if (!userLocation) {
      setError(t('find_shops_error_provide_location'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShops([]);

    try {
      const result = await searchShopsByWasteType(wasteType, userLocation, language);
      setShops(result);
    } catch (e) {
      setError(t('error_ai_busy'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t('find_shops_title')}</h1>
        <p className="text-slate-300 mb-8">{t('find_shops_subtitle')}</p>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
                 <input
                    type="text"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    placeholder={t('find_shops_placeholder')}
                    className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
                />
            </div>
            <button
              onClick={handleGetLocation}
              className={`w-full md:w-auto flex items-center justify-center px-4 py-3 rounded-xl shadow-sm text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                userLocation
                  ? 'bg-green-100 text-eco-green-dark border-2 border-eco-green'
                  : 'bg-gradient-to-r from-eco-accent-start to-eco-accent-end text-white'
              }`}
            >
              <LocationMarkerIcon className="h-5 w-5 mr-2" />
              {userLocation ? t('get_location_button_acquired') : t('get_location_button')}
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading || !userLocation}
              className="w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              {isLoading ? t('searching_button') : t('search_button')}
            </button>
        </div>
        {locationError && <p className="text-red-400 text-sm mt-2">{locationError}</p>}
      </div>

      <div className="mt-8">
        {isLoading && <Spinner />}
        {error && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{error}</p>}
        {shops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms`}}>
                <ShopCard shop={shop} updateEcoScore={updateEcoScore} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindShopsPage;