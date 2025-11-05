import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import FindShopsPage from './components/FindShopsPage';
import IdentifyWastePage from './components/IdentifyWastePage';
import EcoAlternativesPage from './components/EcoAlternativesPage';
import DisposalGuidePage from './components/DisposalGuidePage';
import DIYProjectsPage from './components/DIYProjectsPage';
import RewardsPage from './components/RewardsPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { Page, UserProgress, LanguageCode } from './types';
import Chatbot from './components/Chatbot';
import { translations } from './lib/translations';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [activePage, setActivePage] = useState<Page>('home');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    ecoScore: 0,
    completedMilestones: [],
  });
  const [language, setLanguage] = useState<LanguageCode>(
    () => (localStorage.getItem('ecoloop-lang') as LanguageCode) || 'en'
  );

  useEffect(() => {
    localStorage.setItem('ecoloop-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  // FIX: Updated the 't' function to handle interpolation for dynamic translations.
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    if (options) {
      Object.keys(options).forEach(optionKey => {
        const regex = new RegExp(`{${optionKey}}`, 'g');
        translation = translation.replace(regex, String(options[optionKey]));
      });
    }
    return translation;
  };

  const updateEcoScore = (points: number) => {
    setUserProgress(prev => ({
      ...prev,
      ecoScore: prev.ecoScore + points
    }));
  };


  useEffect(() => {
    const backgroundClasses = ['bg-home', 'bg-find', 'bg-identify', 'bg-alternatives', 'bg-disposal', 'bg-diy', 'bg-rewards', 'bg-login', 'bg-signup'];
    document.body.classList.remove(...backgroundClasses);

    let newClass = '';
    if (isAuthenticated) {
      newClass = `bg-${activePage}`;
    } else {
      newClass = `bg-${authPage}`;
    }
    document.body.classList.add('font-sans', newClass);
  }, [activePage, isAuthenticated, authPage]);

  if (!isAuthenticated) {
    if (authPage === 'login') {
      return <LoginPage 
        onLogin={() => setIsAuthenticated(true)} 
        onSwitchToSignUp={() => setAuthPage('signup')} 
        t={t} 
        language={language}
        setLanguage={setLanguage}
      />;
    } else {
      return <SignUpPage 
        onSignUp={() => setIsAuthenticated(true)} 
        onSwitchToLogin={() => setAuthPage('login')} 
        t={t} 
        language={language}
        setLanguage={setLanguage}
      />;
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage t={t} />;
      case 'find':
        return <FindShopsPage updateEcoScore={updateEcoScore} t={t} language={language} />;
      case 'identify':
        return <IdentifyWastePage updateEcoScore={updateEcoScore} t={t} language={language} />;
      case 'alternatives':
        return <EcoAlternativesPage updateEcoScore={updateEcoScore} t={t} language={language} />;
      case 'disposal':
        return <DisposalGuidePage t={t} language={language} />;
      case 'diy':
        return <DIYProjectsPage t={t} language={language} />;
      case 'rewards':
        return <RewardsPage userProgress={userProgress} t={t} />;
      default:
        return <HomePage t={t} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-200">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => {
          setIsAuthenticated(false);
          setActivePage('home'); // Reset to home on logout
          setUserProgress({ ecoScore: 0, completedMilestones: [] }); // Reset score on logout
        }}
        t={t}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-grow container mx-auto px-4 py-12">
        {renderPage()}
      </main>
      {isAuthenticated && <Chatbot t={t} language={language} />}
      <Footer t={t} />
    </div>
  );
};

export default App;
