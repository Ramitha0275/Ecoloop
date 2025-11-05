import React from 'react';

interface FooterProps {
  t: (key: string) => string;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-auto">
      <div className="container mx-auto py-4 px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Ecoloop. {t('footer_text')}</p>
      </div>
    </footer>
  );
};

export default Footer;