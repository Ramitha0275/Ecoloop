import React from 'react';
import { UserProgress, Milestone } from '../types';
import { TrophyIcon, BadgeIcon } from './icons';

// FIX: Update the 't' function signature to support interpolation for dynamic translations.
interface RewardsPageProps {
  userProgress: UserProgress;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const milestones: Milestone[] = [
  { id: 'novice', requiredScore: 35, title: 'Eco-Novice', description: 'Awarded for starting your journey.', rewardType: 'badge' },
  { id: 'rookie', requiredScore: 75, title: 'Recycling Rookie', description: 'You are getting the hang of it!', rewardType: 'badge' },
  { id: 'guru', requiredScore: 150, title: 'Green Guru', description: '₹100 Amazon Coupon', rewardType: 'coupon' },
  { id: 'star', requiredScore: 300, title: 'Sustainability Star', description: '₹250 Coupon for Eco-friendly Store', rewardType: 'coupon' },
];

const MilestoneCard: React.FC<{ milestone: Milestone; userScore: number; t: (key: string, options?: any) => string }> = ({ milestone, userScore, t }) => {
    const isUnlocked = userScore >= milestone.requiredScore;
    const progress = Math.min((userScore / milestone.requiredScore) * 100, 100);
    
    // Using keys for translation
    const title = t(`milestone_${milestone.id}_title`);
    const description = t(`milestone_${milestone.id}_description`);

    return (
        <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${isUnlocked ? 'bg-slate-700/80 border-t-4 border-eco-green' : 'bg-slate-800/80'}`}>
            <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-eco-green' : 'bg-slate-700'}`}>
                    {milestone.rewardType === 'badge' ? <BadgeIcon className="w-8 h-8 text-white" /> : <TrophyIcon className="w-8 h-8 text-white" />}
                </div>
                <div className="flex-grow">
                    <h3 className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                    <p className="text-xs font-semibold text-eco-green">{t('requires_points_label', { score: milestone.requiredScore })}</p>
                </div>
            </div>
            {!isUnlocked && (
                 <div className="mt-4">
                    <div className="w-full bg-slate-600 rounded-full h-2.5">
                        <div className="bg-eco-green h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-right text-xs mt-1 text-slate-400">{userScore} / {milestone.requiredScore}</p>
                 </div>
            )}
        </div>
    );
};


const RewardsPage: React.FC<RewardsPageProps> = ({ userProgress, t }) => {
    const { ecoScore } = userProgress;
    const nextMilestone = milestones.find(m => ecoScore < m.requiredScore);
    const progressToNext = nextMilestone ? (ecoScore / nextMilestone.requiredScore) * 100 : 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center">
                <h1 className="text-4xl font-bold text-white mb-2">{t('rewards_title')}</h1>
                <p className="text-slate-300 mb-8">{t('rewards_subtitle')}</p>

                <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4A5568"
                        strokeWidth="3"
                        />
                        <path
                        className="transition-all duration-500"
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray={`${progressToNext}, 100`}
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="text-4xl font-bold text-white">{ecoScore}</div>
                        <div className="text-sm text-slate-400">{t('eco_score_label')}</div>
                    </div>
                </div>
                 {nextMilestone && (
                    <p className="mt-4 text-slate-300">
                        {t('points_away_message', { 
                            points: nextMilestone.requiredScore - ecoScore, 
                            milestone: t(`milestone_${nextMilestone.id}_title`) 
                        })}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                 <h2 className="text-3xl font-bold text-center text-white">{t('milestones_title')}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {milestones.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} userScore={ecoScore} t={t} />
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default RewardsPage;
