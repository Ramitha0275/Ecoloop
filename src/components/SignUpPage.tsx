import React, { useState } from 'react';
import { LeafIcon, UserIcon, LockIcon, LanguageIcon } from './icons';
import { LanguageCode } from '../types';
import { languages } from '../lib/translations';

interface SignUpPageProps {
  onSignUp: () => void;
  onSwitchToLogin: () => void;
  t: (key: string) => string;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onSwitchToLogin, t, language, setLanguage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd create a new user here
    onSignUp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center relative">
           <div className="absolute top-4 right-4">
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                onBlur={() => setTimeout(() => setIsLangOpen(false), 200)}
                className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              >
                <LanguageIcon className="h-6 w-6 text-slate-300"/>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl animate-fade-in py-1 z-10">
                  {languages.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-eco-green text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <LeafIcon className="h-10 w-10 text-eco-green" />
            <span className="text-3xl font-bold text-white">Ecoloop</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('signup_title')}</h1>
          <p className="text-slate-300 mb-8">{t('signup_subtitle')}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fullname_placeholder')}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
              />
            </div>
            <div className="relative">
              <UserIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
              />
            </div>
             <div className="relative">
              <LockIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-600/50 rounded-xl focus:ring-eco-green focus:border-eco-green bg-slate-800/90 text-white placeholder-slate-400 transition-shadow duration-200 focus:shadow-md"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark transition-all duration-300 transform hover:scale-105"
            >
              {t('create_account_button')}
            </button>
          </form>

          <div className="mt-6 text-sm">
            <p className="text-slate-400">
              {t('signup_login_prompt')}{' '}
              <button onClick={onSwitchToLogin} className="font-semibold text-eco-green hover:underline">
                {t('login_button')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
