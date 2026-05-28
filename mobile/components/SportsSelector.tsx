import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SportsSelectorProps {
  activeSport: string;
  onSelect: (sport: string) => void;
}

export const SPORTS_LIST = [
  { id: 'all', name: 'All Sports', badge: 'Live' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'ufc', name: 'UFC / MMA', icon: '🥊' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'esports', name: 'Esports', icon: '🎮' },
];

export const SportsSelector: React.FC<SportsSelectorProps> = ({ activeSport, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SPORTS_LIST.map((sport) => {
          const isActive = activeSport === sport.id;
          return (
            <TouchableOpacity
              key={sport.id}
              activeOpacity={0.85}
              onPress={() => onSelect(sport.id)}
              style={[
                styles.tab,
                isActive ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              <Text style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}>
                {sport.icon ? `${sport.icon}  ` : ''}
                {sport.name}
              </Text>
              {sport.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{sport.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faf9f6',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  inactiveTab: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#121212',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

