
import React from 'react';
import { Shop } from '../types';
import { PhoneIcon, MapIcon, TagIcon, RecycleIcon } from './icons';

// FIX: Update the 't' function signature to support interpolation for dynamic translations.
interface ShopCardProps {
  shop: Shop;
  updateEcoScore: (points: number) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, updateEcoScore, t }) => {

  const handleLogDropOff = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateEcoScore(25);
    alert(t('log_drop_off_alert', { score: '25', shopName: shop.name }));
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-eco-green">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{shop.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{shop.address}</p>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <PhoneIcon className="h-5 w-5 text-eco-green mr-3 flex-shrink-0 mt-0.5" />
            <a href={`tel:${shop.phone}`} className="text-slate-300 hover:text-eco-green-dark" onClick={(e) => e.stopPropagation()}>{shop.phone}</a>
          </div>
          <div className="flex items-start">
            <TagIcon className="h-5 w-5 text-eco-green mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">{t('buys_label')}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {shop.wasteTypes.map((type, i) => (
                    <span key={i} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">{type}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-900/50 p-4 mt-auto space-y-2">
        <button
          onClick={handleLogDropOff}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-eco-accent-start to-eco-accent-end hover:from-eco-accent-end hover:to-eco-accent-start transition-all duration-300 transform hover:scale-105"
        >
          <RecycleIcon className="h-5 w-5 mr-2" />
          {t('log_drop_off_button')}
        </button>
        <a
          href={shop.location}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-eco-green-start to-eco-green-end hover:from-eco-green hover:to-eco-green-dark transition-all duration-300 transform hover:scale-105"
           onClick={(e) => e.stopPropagation()}
        >
          <MapIcon className="h-5 w-5 mr-2" />
          {t('view_on_map_button')}
        </a>
      </div>
    </div>
  );
};

export default ShopCard;
