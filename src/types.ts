/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Template {
  id: string;
  title: string;
  description: string;
  image?: string;
  alt: string;
  framework: string;
  category: string;
  code: string;
  demoUrl?: string;
  stars: number;
  author: string;
  views: string;
  lastUpdated: string;
}

export interface ComponentAsset {
  id: string;
  title: string;
  description: string;
  category: 'Buttons' | 'Cards' | 'Navigation' | 'Forms' | 'Overlays';
  code: string;
}

export interface DevTool {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface DeveloperProfile {
  username: string;
  title: string;
  bio: string;
  avatar: string;
  savedTemplates: string[]; // Saved template IDs
  savedComponents: string[]; // Saved component IDs
  apiTokens: ApiToken[];
  stats: {
    copiesCount: number;
    starsCount: number;
    contributions: { [date: string]: number };
  };
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  lastUsed: string;
}

export interface TemplateReview {
  rating: number;
  count: number;
}

export type Tab = 'home' | 'templates' | 'components' | 'tools' | 'playground' | 'profile' | 'admin' | 'support' | 'ai';

export type AIToolType = 'explain' | 'docs' | 'review' | 'regex';

export interface AIResponse {
  content: string;
  error?: string;
  loading: boolean;
}
