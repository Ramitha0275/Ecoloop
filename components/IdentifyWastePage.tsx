import React, { useState, useCallback } from 'react';
import { WasteInfo, Shop, LanguageCode } from '../types';
import { identifyWasteFromImage, searchShopsByWasteType } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon, SearchIcon, CameraIcon } from './icons';
import { fileToBase64 } from '../utils/fileUtils';
import ShopCard from './ShopCard';

interface IdentifyWastePageProps {
  updateEcoScore: (points: number) => void;
  t: (key: string) => string;
  language: LanguageCode;
}

const IdentifyWastePage: React.FC<IdentifyWastePageProps> = ({ updateEcoScore, t, language }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [wasteInfo, setWasteInfo] = useState<WasteInfo | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingShops, setIsFindingShops] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setWasteInfo(null);
      setShops([]);
      setError(null);
    }
  };
  
  const handleIdentify = async () => {
    if (!imageFile) {
      setError(t('error_upload_image'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setWasteInfo(null);
    setShops([]);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await identifyWasteFromImage(base64Image, imageFile.type, language);
      setWasteInfo(result);
      updateEcoScore(5); // Award points for identification
    } catch (e) {
      setError(t('error_identify_waste'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

   const handleFindShops = useCallback(async () => {
    if (!wasteInfo?.wasteCategory) return;

    if (!userLocation) {
      setLocationError(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(location);
            findShops(wasteInfo.wasteCategory, location);
          },
          () => {
            setLocationError(t('location_error_enable'));
            setError(t('location_error_enable'));
          }
        );
      } else {
        setLocationError(t('location_error_unsupported'));
        setError(t('location_error_unsupported'));
      }
    } else {
      findShops(wasteInfo.wasteCategory, userLocation);
    }
  }, [wasteInfo, userLocation, language, t]);

  const findShops = async (category: string, location: { lat: number; lng: number }) => {
    setIsFindingShops(true);
    setError(null);
    setShops([]);
    try {
      const result = await searchShopsByWasteType(category, location, language);
      setShops(result);
    } catch (e) {
      setError(t('error_find_shops_for_waste'));
      console.error(e);
    } finally {
      setIsFindingShops(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t('identify_waste_title')}</h1>
        <p className="text-slate-300 mb-6">{t('identify_waste_subtitle')}</p>
        
        <div className="flex flex-col items-center gap-4">
          <label className="w-full max-w-lg cursor-pointer bg-slate-800/80 border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:bg-slate-700 hover:border-eco-green transition-colors duration-300">
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt={t('preview_alt')} className="h-32 w-32 object-cover rounded-md mb-4" />
              ) : (
                <CameraIcon className="h-16 w-16 text-slate-400 mb-4" />
              )}
              <span className="font-semibold text-white">{imageFile ? imageFile.name : t('upload_image_cta')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </label>
          <button
            onClick={handleIdentify}
            disabled={isLoading || !imageFile}
            className="w-full max-w-lg flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <UploadIcon className="h-5 w-5 mr-2" />
            {isLoading ? t('analyzing_button') : t('identify_waste_button')}
          </button>
        </div>
      </div>
      
      {isLoading && <Spinner />}
      {error && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{error}</p>}

      {wasteInfo && (
        <div className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-slide-up">
          <h2 className="text-2xl font-bold mb-4 text-white">{t('analysis_result_title')}</h2>
          <div className="space-y-4">
            <p><strong className="font-semibold text-white">{t('classification_label')}</strong> <span className={`px-3 py-1 rounded-full text-sm font-medium ${wasteInfo.classification === 'Biodegradable' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{wasteInfo.classification}</span></p>
            <p><strong className="font-semibold text-white">{t('category_label')}</strong> {wasteInfo.wasteCategory}</p>
            <p className="text-slate-300"><strong className="font-semibold text-white">{t('explanation_label')}</strong> {wasteInfo.explanation}</p>
          </div>
          <button
            onClick={handleFindShops}
            disabled={isFindingShops}
            className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-accent-start to-eco-accent-end hover:from-eco-accent-end hover:to-eco-accent-start disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105"
          >
             <SearchIcon className="h-5 w-5 mr-2"/>
             {isFindingShops ? t('finding_shops_button') : `${t('find_shops_for_button')} ${wasteInfo.wasteCategory}`}
          </button>
        </div>
      )}

      {isFindingShops && <Spinner />}
      {locationError && !isFindingShops && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{locationError}</p>}
      {shops.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {shops.map((shop, index) => (
               <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms`}}>
                <ShopCard shop={shop} updateEcoScore={updateEcoScore} t={t} />
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default IdentifyWastePage;