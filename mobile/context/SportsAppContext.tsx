import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTab = 'home' | 'schedules' | 'wrestling' | 'favorites' | 'search';

interface SportsAppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  favorites: string[]; // Match or team IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const SportsAppContext = createContext<SportsAppContextType | undefined>(undefined);

export const SportsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toggle favorite team or match ID
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <SportsAppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </SportsAppContext.Provider>
  );
};

export const useSportsApp = () => {
  const context = useContext(SportsAppContext);
  if (!context) {
    throw new Error('useSportsApp must be used within a SportsAppProvider');
  }
  return context;
};
