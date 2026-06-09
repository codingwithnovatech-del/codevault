/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, FileCode, Component, Wrench, CircleUser, Shield, LifeBuoy, Play } from 'lucide-react';
import { Tab } from '../types';
import AdBanner from './AdBanner';

interface BottomNavBarProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  showAdmin?: boolean;
}

export default function BottomNavBar({ currentTab, setTab, showAdmin }: BottomNavBarProps) {
  const tabsConfig: { id: Tab; label: string; icon: any }[] = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'templates' as Tab, label: 'Templates', icon: FileCode },
    { id: 'components' as Tab, label: 'Components', icon: Component },
    { id: 'tools' as Tab, label: 'Tools', icon: Wrench },
    { id: 'playground' as Tab, label: 'Play', icon: Play },
    { id: 'profile' as Tab, label: 'Profile', icon: CircleUser },
    { id: 'support' as Tab, label: 'Support', icon: LifeBuoy },
  ];

  if (showAdmin) {
    tabsConfig.push({ id: 'admin' as Tab, label: 'Admin', icon: Shield });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="flex justify-center bg-surface-container border-t border-outline-variant px-2 py-1">
        <AdBanner zoneId="11410702" />
      </div>
      <nav id="bottom-nav-bar" className="bg-surface-container border-t border-outline-variant shadow-2xl flex justify-around items-center h-20 px-2 pb-safe">
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            id={`nav-item-${tab.id}`}
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 min-w-[70px] h-13 shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface w-16 h-14 rounded-xl'
            }`}
          >
            <Icon className={`${isActive ? 'h-5 w-5 mb-0.5' : 'h-[22px] w-[22px] mb-1'}`} />
            <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
    </div>
  );
}
