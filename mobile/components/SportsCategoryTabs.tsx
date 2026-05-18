import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PlayCircle, Trophy, Activity, Target } from 'lucide-react-native';

export type SportCategory = 'football' | 'cricket' | 'basketball' | 'ufc' | 'f1' | 'tennis' | 'esports';

export const SPORTS_CATEGORIES: { id: SportCategory; name: string }[] = [
  { id: 'football', name: 'Football' },
  { id: 'cricket', name: 'Cricket' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'ufc', name: 'UFC / MMA' },
  { id: 'f1', name: 'Formula 1' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'esports', name: 'Esports' },
];

interface SportsCategoryTabsProps {
  activeSport: SportCategory;
  onSelect: (sport: SportCategory) => void;
}

export const SportsCategoryTabs: React.FC<SportsCategoryTabsProps> = ({ activeSport, onSelect }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SPORTS_CATEGORIES.map((sport) => {
        const isActive = activeSport === sport.id;
        return (
          <TouchableOpacity 
            key={sport.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelect(sport.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#ff0000',
    borderColor: '#ff0000',
  },
  tabText: {
    color: '#a3a3a3',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#ffffff',
  }
});
