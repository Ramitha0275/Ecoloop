import React, { useState } from 'react';
import { DisposalGuide, LanguageCode } from '../types';
import { getDisposalInstructions } from '../services/geminiService';
import Spinner from './Spinner';
import { CameraIcon, DisposalGuideIcon, WarningIcon } from './icons';
import { fileToBase64 } from '../utils/fileUtils';

interface DisposalGuidePageProps {
  t: (key: string) => string;
  language: LanguageCode;
}

const DisposalGuidePage: React.FC<DisposalGuidePageProps> = ({ t, language }) => {
  const [itemName, setItemName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guide, setGuide] = useState<DisposalGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemName(''); // Clear text input
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGuide(null);
      setError(null);
    }
  };
  
  const handleGetGuide = async () => {
    if (!itemName.trim() && !imageFile) {
      setError(t('disposal_error_no_input'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGuide(null);

    try {
      let result;
      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        result = await getDisposalInstructions(base64Image, language, imageFile.type);
      } else {
        result = await getDisposalInstructions(itemName, language);
      }
      setGuide(result);
    } catch (e) {
      setError(t('error_ai_busy'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t('disposal_guide_title')}</h1>
        <p className="text-slate-300 mb-6">{t('disposal_guide_subtitle')}</p>
        
        <div className="flex flex-col items-center gap-4">
           <input
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setImageFile(null);
                setPreviewUrl(null);
              }}
              placeholder={t('disposal_guide_placeholder')}
              className="w-full max-w-lg px-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
            />
            
            <p className="text-center text-sm font-medium text-slate-400">{t('or_divider')}</p>

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
            onClick={handleGetGuide}
            disabled={isLoading}
            className="w-full max-w-lg flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <DisposalGuideIcon className="h-5 w-5 mr-2" />
            {isLoading ? t('generating_guide_button') : t('get_disposal_guide_button')}
          </button>
        </div>
      </div>
      
      {isLoading && <Spinner />}
      {error && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{error}</p>}

      {guide && (
        <div className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-slide-up">
          <h2 className="text-2xl font-bold mb-1 text-white">{t('disposal_guide_for_label')} <span className="text-eco-green">{guide.itemName}</span></h2>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">{t('preparation_steps_label')}</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-300">
              {guide.steps.map((step, index) => (
                <li key={index} className="pl-2 border-l-4 border-eco-green bg-slate-800/50 p-3 rounded-r-lg">
                  {step}
                </li>
              ))}
            </ol>
          </div>
          
          {guide.safetyWarnings && guide.safetyWarnings.length > 0 && (
             <div className="mt-6 bg-red-900/50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center"><WarningIcon className="h-5 w-5 mr-2 text-red-400"/>{t('safety_warnings_label')}</h3>
                <ul className="list-disc list-inside space-y-2 text-red-200">
                    {guide.safetyWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                    ))}
                </ul>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default DisposalGuidePage;