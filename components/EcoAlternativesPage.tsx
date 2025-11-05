import React, { useState, useCallback } from 'react';
import { EcoAlternativesResponse, AlternativeProduct, LanguageCode } from '../types';
import { findEcoAlternatives, generateImageFromPrompt } from '../services/geminiService';
import Spinner from './Spinner';
import { LeafIcon, CameraIcon, LocationMarkerIcon, ClockIcon, CubeIcon, ExternalLinkIcon, ShoppingBagIcon, PhoneIcon, MapIcon } from './icons';
import { fileToBase64 } from '../utils/fileUtils';

interface EcoAlternativesPageProps {
  updateEcoScore: (points: number) => void;
  t: (key: string) => string;
  language: LanguageCode;
}

const EcoAlternativesPage: React.FC<EcoAlternativesPageProps> = ({ updateEcoScore, t, language }) => {
  const [productName, setProductName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<EcoAlternativesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductName(''); // Clear text input if image is selected
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

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
    if (!productName.trim() && !imageFile) {
      setError(t('alternatives_error_no_input'));
      return;
    }
     if (!userLocation) {
      setError(t('alternatives_error_no_location'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      let initialResults;
      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        initialResults = await findEcoAlternatives(base64Image, userLocation, language, imageFile.type);
      } else {
        initialResults = await findEcoAlternatives(productName, userLocation, language);
      }
      
      setResults(initialResults);
      updateEcoScore(10); // Award points for finding alternatives
      setIsLoading(false);

      const updatedAlternatives = await Promise.all(
        initialResults.alternatives.map(async (alt) => {
          try {
            const base64Image = await generateImageFromPrompt(alt.imagePrompt);
            return { ...alt, imageData: `data:image/png;base64,${base64Image}` };
          } catch (imgError) {
            console.error(`Failed to generate image for ${alt.name}:`, imgError);
            return { ...alt, imageData: '' }; // Empty string indicates failure
          }
        })
      );
      
      setResults({
        ...initialResults,
        alternatives: updatedAlternatives,
      });

    } catch (e) {
      setError(t('error_ai_busy'));
      console.error(e);
      setIsLoading(false);
    }
  };

  const renderImage = (alt: AlternativeProduct) => {
    if (alt.imageData === undefined) {
      // Image is loading
      return (
        <div className="w-full md:w-1/3 h-64 md:h-auto bg-slate-700 flex items-center justify-center rounded-l-xl">
          <Spinner />
        </div>
      );
    }
    if (alt.imageData) {
      // Image loaded successfully
      return <img src={alt.imageData} alt={alt.name} className="w-full md:w-1/3 h-64 md:h-auto object-cover rounded-l-xl" />;
    }
    // Image failed to load
    return (
      <div className="w-full md:w-1/3 h-64 md:h-auto bg-red-900/80 flex items-center justify-center p-4 rounded-l-xl">
        <p className="text-xs text-red-300 text-center">{t('error_image_generation')}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {!results && (
        <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{t('alternatives_title')}</h1>
          <p className="text-slate-300 mb-6">{t('alternatives_subtitle')}</p>
          
          <div className="space-y-4 max-w-md mx-auto">
             <button
              onClick={handleGetLocation}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-xl shadow-sm text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                userLocation
                  ? 'bg-green-100 text-eco-green-dark border-2 border-eco-green'
                  : 'bg-gradient-to-r from-eco-accent-start to-eco-accent-end text-white'
              }`}
            >
              <LocationMarkerIcon className="h-5 w-5 mr-2" />
              {userLocation ? t('get_location_button_acquired') : t('alternatives_get_location_button')}
            </button>
            {locationError && <p className="text-red-400 text-sm -mt-2">{locationError}</p>}
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setImageFile(null);
                setPreviewUrl(null);
              }}
              placeholder={t('alternatives_placeholder')}
              className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
            />
            
            <p className="text-center text-sm font-medium text-slate-400">{t('or_divider')}</p>
            
             <label className="w-full flex flex-col items-center justify-center space-y-2 p-6 cursor-pointer bg-slate-800/80 border-2 border-dashed border-slate-600 rounded-xl hover:bg-slate-700 hover:border-eco-green transition-colors duration-300">
              {previewUrl ? (
                <img src={previewUrl} alt={t('preview_alt')} className="h-32 w-32 object-cover rounded-md" />
              ) : (
                <CameraIcon className="h-12 w-12 text-slate-400" />
              )}
              <span className="font-semibold text-white text-sm break-all">{imageFile ? imageFile.name : t('upload_image_of_product')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

             <button
              onClick={handleSearch}
              disabled={isLoading || !userLocation}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              <LeafIcon className="h-5 w-5 mr-2" />
              {isLoading ? t('searching_button') : t('find_alternatives_button')}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 space-y-8">
        {isLoading && !results && <Spinner />}
        {error && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{error}</p>}
        {results && (
          <>
            {/* Original Product Analysis */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-slide-up">
                <h2 className="text-xl font-bold text-white mb-1">{t('analysis_of_label')} <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-eco-accent-start to-eco-accent-end">{results.originalProduct.name}</span></h2>
                <p className="text-slate-300 mb-4 text-sm">{results.originalProduct.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-200">
                    <div className="bg-slate-800 p-3 rounded-lg">
                        <strong>{t('classification_label')}</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${results.originalProduct.classification === 'Biodegradable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{results.originalProduct.classification}</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg">
                        <strong>{t('material_label')}</strong> {results.originalProduct.material}
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg">
                        <strong>{t('degradation_time_label')}</strong> {results.originalProduct.degradationTime}
                    </div>
                </div>
            </div>

            {/* Alternatives */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-6 text-white">{t('alternatives_results_title')}</h2>
              <div className="space-y-6">
                {results.alternatives.map((alt, index) => (
                  <div key={index} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden animate-slide-up flex flex-col md:flex-row border-t-4 border-eco-green" style={{ animationDelay: `${200 + index * 100}ms`}}>
                    {renderImage(alt)}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-white mb-2">{alt.name}</h3>
                      <p className="text-slate-300 text-sm mb-4 flex-grow">{alt.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-slate-200">
                        <div className="flex items-center"><CubeIcon className="h-5 w-5 mr-2 text-eco-green"/> <strong>{t('material_label')}</strong>&nbsp;{alt.material}</div>
                        <div className="flex items-center"><ClockIcon className="h-5 w-5 mr-2 text-eco-green"/> <strong>{t('degrades_in_label')}</strong>&nbsp;{alt.degradationTime}</div>
                      </div>
                      <div className="mb-4">
                         <a href={alt.buyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border-2 border-eco-accent-start rounded-lg shadow-sm text-sm font-medium text-eco-accent-end bg-slate-800 hover:bg-slate-700 w-full transition-all duration-300 transform hover:scale-105">
                           <ExternalLinkIcon className="h-5 w-5 mr-2"/> {t('buy_online_button')}
                         </a>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm flex items-center mb-2 text-white"><ShoppingBagIcon className="h-5 w-5 mr-2 text-slate-400"/>{t('nearby_shops_label')}</h4>
                        <div className="space-y-2">
                           {alt.shops.map((shop, s_index) => (
                            <div key={s_index} className="bg-slate-700 p-2 rounded-lg flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-100">{shop.name}</p>
                                <a href={`tel:${shop.phone}`} className="flex items-center text-slate-300 hover:text-eco-green-dark"><PhoneIcon className="h-3 w-3 mr-1"/>{shop.phone}</a>
                              </div>
                              <a href={shop.location} target="_blank" rel="noopener noreferrer" className="text-eco-green hover:text-eco-green-dark p-2 rounded-full hover:bg-green-100/10 transition-colors"><MapIcon className="h-5 w-5"/></a>
                            </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-8">
                <button onClick={() => setResults(null)} className="px-6 py-2 bg-eco-green text-white rounded-xl shadow-sm hover:bg-eco-green-dark transition-all transform hover:scale-105">{t('search_again_button')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EcoAlternativesPage;