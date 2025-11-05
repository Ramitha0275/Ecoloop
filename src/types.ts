export type Page = 'home' | 'find' | 'identify' | 'alternatives' | 'disposal' | 'diy' | 'rewards';

export interface Shop {
  name: string;
  wasteTypes: string[];
  phone: string;
  address: string;
  location: string;
}

export interface WasteInfo {
  classification: 'Biodegradable' | 'Non-biodegradable';
  explanation: string;
  wasteCategory: string;
}

export interface OriginalProductInfo {
  name: string;
  classification: 'Biodegradable' | 'Non-biodegradable';
  material: string;
  degradationTime: string;
  description: string;
}

export interface AlternativeShop {
  name: string;
  location: string;
  phone: string;
}

export interface AlternativeProduct {
  name: string;
  description: string;
  imagePrompt: string;
  imageData?: string;
  degradationTime: string;
  material: string;
  buyLink: string;
  shops: AlternativeShop[];
}

export interface EcoAlternativesResponse {
  originalProduct: OriginalProductInfo;
  alternatives: AlternativeProduct[];
}

export interface DisposalGuide {
  itemName: string;
  steps: string[];
  safetyWarnings: string[];
}

export interface DIYStep {
  step: number;
  instruction: string;
  imagePrompt: string;
  imageData?: string;
}

export interface DIYProject {
  title: string;
  description: string;
  materials: string[];
  steps: DIYStep[];
}

// Gamification Types
export interface Milestone {
  id: string;
  requiredScore: number;
  title: string;
  description: string;
  rewardType: 'badge' | 'coupon';
}

export interface UserProgress {
  ecoScore: number;
  completedMilestones: string[]; // Array of milestone IDs
}

// Chatbot Types
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Multilingual support
export const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn'] as const;
export type LanguageCode = typeof supportedLanguages[number];

export interface Language {
  code: LanguageCode;
  name: string;
}

export type TranslationKeys = {
  [key: string]: string;
}

export type Translations = {
  [key in LanguageCode]: TranslationKeys;
}
