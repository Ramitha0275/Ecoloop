import React, { useState } from 'react';
import { Page, LanguageCode } from '../types';
import { LeafIcon, LanguageIcon } from './icons';
import { languages } from '../lib/translations';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onLogout: () => void;
  t: (key: string) => string;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const NavLink: React.FC<{
  page: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  children: React.ReactNode;
}> = ({ page, activePage, setActivePage, children }) => {
  const isActive = activePage === page;
  const classes = `relative px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
    isActive
      ? 'text-eco-green font-bold'
      : 'text-slate-300 hover:text-white'
  }`;
  return (
    <button onClick={() => setActivePage(page)} className={classes}>
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-eco-green rounded-full"></span>
      )}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onLogout, t, language, setLanguage }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="bg-slate-900/30 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActivePage('home')}>
            <LeafIcon className="h-8 w-8 text-eco-green" />
            <span className="text-2xl font-bold text-white">Ecoloop</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <NavLink page="home" activePage={activePage} setActivePage={setActivePage}>{t('nav_home')}</NavLink>
            <NavLink page="find" activePage={activePage} setActivePage={setActivePage}>{t('nav_find_shops')}</NavLink>
            <NavLink page="identify" activePage={activePage} setActivePage={setActivePage}>{t('nav_identify_waste')}</NavLink>
            <NavLink page="alternatives" activePage={activePage} setActivePage={setActivePage}>{t('nav_alternatives')}</NavLink>
            <NavLink page="disposal" activePage={activePage} setActivePage={setActivePage}>{t('nav_disposal_guide')}</NavLink>
            <NavLink page="diy" activePage={activePage} setActivePage={setActivePage}>{t('nav_diy_projects')}</NavLink>
            <NavLink page="rewards" activePage={activePage} setActivePage={setActivePage}>{t('nav_rewards')}</NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  onBlur={() => setTimeout(() => setIsLangOpen(false), 200)}
                  className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                >
                  <LanguageIcon className="h-6 w-6 text-slate-300"/>
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl animate-fade-in py-1">
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
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-eco-green/80 rounded-lg hover:bg-eco-green transition-colors duration-300"
            >
              {t('logout_button')}
            </button>
          </div>
        </div>
         <div className="md:hidden flex flex-wrap items-center justify-center pb-4 space-x-1 border-t border-slate-700/50 mt-2 pt-2 gap-y-2">
            <NavLink page="home" activePage={activePage} setActivePage={setActivePage}>{t('nav_home_mobile')}</NavLink>
            <NavLink page="find" activePage={activePage} setActivePage={setActivePage}>{t('nav_find_shops_mobile')}</NavLink>
            <NavLink page="identify" activePage={activePage} setActivePage={setActivePage}>{t('nav_identify_waste_mobile')}</NavLink>
            <NavLink page="alternatives" activePage={activePage} setActivePage={setActivePage}>{t('nav_alternatives_mobile')}</NavLink>
            <NavLink page="disposal" activePage={activePage} setActivePage={setActivePage}>{t('nav_disposal_guide_mobile')}</NavLink>
            <NavLink page="diy" activePage={activePage} setActivePage={setActivePage}>{t('nav_diy_projects_mobile')}</NavLink>
            <NavLink page="rewards" activePage={activePage} setActivePage={setActivePage}>{t('nav_rewards_mobile')}</NavLink>
             <button 
              onClick={onLogout}
              className="px-3 py-2 text-xs font-semibold text-white bg-eco-green/80 rounded-lg hover:bg-eco-green transition-colors duration-300"
            >
              {t('logout_button')}
            </button>
          </div>
      </nav>
    </header>
  );
};

export default Header;
