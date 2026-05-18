import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLiveScores } from '../hooks/useSportsData';
import { LiveScoreCard } from '../components/LiveScoreCard';
import { useSportsApp } from '../context/SportsAppContext';
import { Star, Trophy, ArrowRight, Heart } from 'lucide-react-native';

const SPORTS = ['football', 'cricket', 'basketball', 'ufc', 'f1', 'tennis', 'esports'] as const;

export const FavoritesScreen: React.FC = () => {
  const { favorites, isFavorite, toggleFavorite, setActiveTab } = useSportsApp();
  const [refreshing, setRefreshing] = useState(false);

  // We fetch scores across all sports simultaneously using custom query hooks.
  // In React Native with React Query, these queries utilize local cache immediately,
  // making this page render instantly with zero network lag!
  const footballQuery = useLiveScores('football');
  const cricketQuery = useLiveScores('cricket');
  const basketballQuery = useLiveScores('basketball');
  const ufcQuery = useLiveScores('ufc');
  const f1Query = useLiveScores('f1');
  const tennisQuery = useLiveScores('tennis');
  const esportsQuery = useLiveScores('esports');

  const allMatches = [
    ...(footballQuery.data || []),
    ...(cricketQuery.data || []),
    ...(basketballQuery.data || []),
    ...(ufcQuery.data || []),
    ...(f1Query.data || []),
    ...(tennisQuery.data || []),
    ...(esportsQuery.data || []),
  ];

  const favoriteMatches = allMatches.filter((match) => isFavorite(match.id));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      footballQuery.refetch(),
      cricketQuery.refetch(),
      basketballQuery.refetch(),
      ufcQuery.refetch(),
      f1Query.refetch(),
      tennisQuery.refetch(),
      esportsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const isLoading = 
    footballQuery.isLoading || 
    cricketQuery.isLoading || 
    basketballQuery.isLoading;

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>PERSONALIZED FEED</Text>
        <Text style={styles.title}>MY FAVORITES</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#ff0000"
            colors={['#ff0000']}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#ff0000" size="large" style={{ marginTop: 40 }} />
        ) : favoriteMatches.length === 0 ? (
          // Beautiful Empty State with Call To Action
          <View style={styles.emptyContainer}>
            <View style={styles.heartCircle}>
              <Heart color="#ffffff" size={32} fill="#ffffff" />
            </View>
            <Text style={styles.emptyTitle}>Your Personalized Feed is Empty</Text>
            <Text style={styles.emptyDesc}>
              Tap the "Add Favorite" star on any active live match to build your personalized real-time alerts feed!
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreText}>Explore Live Arena</Text>
              <ArrowRight color="#ffffff" size={14} />
            </TouchableOpacity>
          </View>
        ) : (
          // Display favorited matches list
          <View style={styles.list}>
            <Text style={styles.listSubText}>
              Showing {favoriteMatches.length} favorited matches in real-time.
            </Text>
            {favoriteMatches.map((match) => (
              <LiveScoreCard 
                key={match.id}
                match={match}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(match.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#121212',
  },
  subtitle: {
    color: '#666',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 40,
    gap: 16,
    marginHorizontal: 16,
  },
  heartCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff0000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyDesc: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  exploreText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    paddingBottom: 24,
  },
  listSubText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  }
});
