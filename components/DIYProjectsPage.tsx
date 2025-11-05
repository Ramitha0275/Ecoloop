import React, { useState } from 'react';
import { DIYProject, DIYStep, LanguageCode } from '../types';
import { getDIYProjectIdeas, generateImageFromPrompt } from '../services/geminiService';
import Spinner from './Spinner';
import { CameraIcon, LightbulbIcon, CubeIcon } from './icons';
import { fileToBase64 } from '../utils/fileUtils';

interface DIYProjectsPageProps {
  t: (key: string) => string;
  language: LanguageCode;
}

const DIYProjectsPage: React.FC<DIYProjectsPageProps> = ({ t, language }) => {
  const [itemName, setItemName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [project, setProject] = useState<DIYProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemName(''); // Clear text input
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProject(null);
      setError(null);
    }
  };
  
  const handleGetProject = async () => {
    if (!itemName.trim() && !imageFile) {
      setError(t('diy_error_no_input'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setProject(null);

    try {
      let initialProject;
      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        initialProject = await getDIYProjectIdeas(base64Image, language, imageFile.type);
      } else {
        initialProject = await getDIYProjectIdeas(itemName, language);
      }
      
      setProject(initialProject);
      setIsLoading(false);

      // Now, generate images for each step
      const updatedSteps = await Promise.all(
        initialProject.steps.map(async (step) => {
          try {
            const base64Image = await generateImageFromPrompt(step.imagePrompt);
            const newStep = { ...step, imageData: `data:image/png;base64,${base64Image}` };
            // Update state progressively
            setProject(currentProject => {
              if (!currentProject) return null;
              const stepIndex = currentProject.steps.findIndex(s => s.step === newStep.step);
              if (stepIndex === -1) return currentProject;
              const newSteps = [...currentProject.steps];
              newSteps[stepIndex] = newStep;
              return { ...currentProject, steps: newSteps };
            });
            return newStep;
          } catch (imgError) {
            console.error(`Failed to generate image for step ${step.step}:`, imgError);
            const failedStep = { ...step, imageData: '' }; // Empty string indicates failure
             setProject(currentProject => {
              if (!currentProject) return null;
              const stepIndex = currentProject.steps.findIndex(s => s.step === failedStep.step);
              if (stepIndex === -1) return currentProject;
              const newSteps = [...currentProject.steps];
              newSteps[stepIndex] = failedStep;
              return { ...currentProject, steps: newSteps };
            });
            return failedStep;
          }
        })
      );
      
    } catch (e) {
      setError(t('error_ai_busy'));
      console.error(e);
      setIsLoading(false);
    }
  };

  const renderStepImage = (step: DIYStep) => {
    if (step.imageData === undefined) {
      // Image is loading
      return (
        <div className="w-full h-48 bg-slate-700/80 flex items-center justify-center rounded-xl">
          <Spinner />
        </div>
      );
    }
    if (step.imageData) {
      // Image loaded successfully
      return <img src={step.imageData} alt={`${t('step_alt')} ${step.step}`} className="w-full h-auto object-cover rounded-xl shadow-md" />;
    }
    // Image failed to load
    return (
      <div className="w-full h-48 bg-red-900/80 flex items-center justify-center p-4 rounded-xl">
        <p className="text-xs text-red-300 text-center">{t('error_image_generation_step')}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {!project && (
        <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{t('diy_title')}</h1>
          <p className="text-slate-300 mb-6">{t('diy_subtitle')}</p>
          
          <div className="flex flex-col items-center gap-4">
             <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                placeholder={t('diy_placeholder')}
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
              onClick={handleGetProject}
              disabled={isLoading}
              className="w-full max-w-lg flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              <LightbulbIcon className="h-5 w-5 mr-2" />
              {isLoading ? t('generating_idea_button') : t('generate_diy_project_button')}
            </button>
          </div>
        </div>
      )}
      
      {isLoading && !project && <Spinner />}
      {error && <p className="text-center text-red-400 bg-red-900/80 p-4 rounded-xl">{error}</p>}

      {project && (
        <div className="space-y-8">
            <div className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-slide-up text-center">
                <h2 className="text-4xl font-extrabold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-eco-green-start to-eco-green-end">{project.title}</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">{project.description}</p>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center"><CubeIcon className="h-5 w-5 mr-2"/>{t('materials_needed_label')}</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {project.materials.map((material, index) => (
                            <span key={index} className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full">{material}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {project.steps.map((step) => (
                    <div key={step.step} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col md:flex-row gap-6 items-center animate-slide-up" style={{ animationDelay: `${200 + step.step * 100}ms`}}>
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            {renderStepImage(step)}
                        </div>
                        <div className="flex-grow">
                            <h4 className="text-xl font-bold text-white mb-2">{t('step_label')} {step.step}</h4>
                            <p className="text-slate-300">{step.instruction}</p>
                        </div>
                    </div>
                ))}
            </div>
             <div className="text-center mt-8">
                <button onClick={() => setProject(null)} className="px-6 py-2 bg-eco-green text-white rounded-xl shadow-sm hover:bg-eco-green-dark transition-all transform hover:scale-105">{t('create_another_project_button')}</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DIYProjectsPage;