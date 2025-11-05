import React from 'react';
import { RefuseIcon, ReduceIcon, ReuseIcon, RecycleIcon, RotIcon } from './icons';

interface RCardProps { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}

const RCard: React.FC<RCardProps> = ({ icon, title, description, color }) => (
  <div className={`bg-slate-800/80 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center border-t-4 ${color}`}>
    <div className={`text-white mb-4 p-3 rounded-full bg-gradient-to-br from-eco-green-start to-eco-green-end`}>{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-slate-300 text-sm">{description}</p>
  </div>
);

interface HomePageProps {
  t: (key: string) => string;
}

const HomePage: React.FC<HomePageProps> = ({ t }) => {
  return (
    <div className="space-y-16 animate-fade-in">
      <section 
        className="text-center py-20 px-4"
      >
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">{t('home_title')}</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            {t('home_subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-slate-900/60 backdrop-blur-lg p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">{t('home_5rs_title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
           <RCard 
            icon={<RefuseIcon className="h-10 w-10" />}
            title={t('refuse_title')}
            description={t('refuse_desc')}
            color="border-red-400"
          />
          <RCard 
            icon={<ReduceIcon className="h-10 w-10" />}
            title={t('reduce_title')}
            description={t('reduce_desc')}
            color="border-blue-400"
          />
          <RCard 
            icon={<ReuseIcon className="h-10 w-10" />}
            title={t('reuse_title')}
            description={t('reuse_desc')}
            color="border-yellow-400"
          />
           <RCard 
            icon={<RecycleIcon className="h-10 w-10" />}
            title={t('recycle_title')}
            description={t('recycle_desc')}
            color="border-green-400"
          />
          <RCard 
            icon={<RotIcon className="h-10 w-10" />}
            title={t('rot_title')}
            description={t('rot_desc')}
            color="border-purple-400"
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;