import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { useLiveScores } from '../hooks/useSportsData';
import { SportsCategoryTabs, SportCategory } from '../components/SportsCategoryTabs';
import { LiveScoreCard } from '../components/LiveScoreCard';
import { NewsHighlightCard } from '../components/NewsHighlightCard';
import { useSportsApp } from '../context/SportsAppContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ShieldAlert, Award, Zap, Compass } from 'lucide-react-native';

// Static Play-Store Safe High-Fidelity Official News Database
const OFFICIAL_NEWS_FEEDS: Record<SportCategory, any[]> = {
  football: [
    { id: 'n-fb-1', type: 'news', title: 'Champions League Quarter-Final Draws Announced', summary: 'Manchester City will face Real Madrid in a highly anticipated rematch of last year\'s semi-final, while Arsenal takes on Bayern Munich.', thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600', source: 'Sky Sports', date: new Date().toISOString(), url: 'https://www.skysports.com/football' },
    { id: 'n-fb-2', type: 'highlight', title: 'Official Highlights: Chelsea vs Arsenal (2 - 1)', thumbnail: 'https://images.unsplash.com/photo-1540747737956-37872f74757a?q=80&w=600', source: 'Premier League YT', date: new Date().toISOString(), url: 'https://www.youtube.com' }
  ],
  cricket: [
    { id: 'n-cr-1', type: 'news', title: 'India Declares In WTC Finals Against Australia', summary: 'Virat Kohli hit a sensational 144 runs to put India in a commanding position. Australia requires 340 runs to win on day 5.', thumbnail: 'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=600', source: 'ICC Cricket', date: new Date().toISOString(), url: 'https://www.icc-cricket.com' }
  ],
  basketball: [
    { id: 'n-bk-1', type: 'news', title: 'LeBron James Drops 42 Points in Double-OT Thriller', summary: 'The Los Angeles Lakers secured a crucial victory against the Golden State Warriors in a historic double-overtime matchup.', thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600', source: 'NBA Official', date: new Date().toISOString(), url: 'https://www.nba.com' }
  ],
  ufc: [
    { id: 'n-uf-1', type: 'news', title: 'Islam Makhachev Declares Next Fight Against Arman Tsarukyan', summary: 'The lightweight champion will defend his belt at UFC 312 in Madison Square Garden. Tickets are set to go on sale next week.', thumbnail: 'https://images.unsplash.com/photo-1517438476312-10d79c07750d?q=80&w=600', source: 'UFC.com', date: new Date().toISOString(), url: 'https://www.ufc.com' }
  ],
  f1: [
    { id: 'n-f1-1', type: 'news', title: 'Max Verstappen Takes Pole Position at Monaco Grand Prix', summary: 'Red Bull Racing dominated the tight street circuit of Monte Carlo. Charles Leclerc claims second spot for Ferrari.', thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600', source: 'F1 Official', date: new Date().toISOString(), url: 'https://www.formula1.com' }
  ],
  tennis: [
    { id: 'n-tn-1', type: 'news', title: 'Carlos Alcaraz Defeats Jannik Sinner in Epic Wimbledon Semifinal', summary: 'In a battle of the young superstars, Alcaraz prevailed in five gruelling sets to advance to the finals on Centre Court.', thumbnail: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600', source: 'Wimbledon Tour', date: new Date().toISOString(), url: 'https://www.wimbledon.com' }
  ],
  esports: [
    { id: 'n-es-1', type: 'news', title: 'Sentinels Advance to VCT Masters Finals in Tokyo', summary: 'Sentinels secured a dominant 3-1 victory over Fnatic in the lower bracket final to book their spot in the grand finals.', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', source: 'VCT Valorant', date: new Date().toISOString(), url: 'https://valorantesports.com' }
  ]
};

export const SportsDashboardScreen: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportCategory>('football');
  const [refreshing, setRefreshing] = useState(false);
  const { isFavorite, toggleFavorite } = useSportsApp();

  // Query live scores from API
  const { 
    data: liveMatches, 
    isLoading: scoresLoading, 
    refetch: refetchScores, 
    error: scoresError 
  } = useLiveScores(activeSport);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchScores();
    setRefreshing(false);
  };

  const activeNews = OFFICIAL_NEWS_FEEDS[activeSport] || [];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#ff0000"
          colors={['#ff0000']}
        />
      }
    >
      {/* Visual Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>WELCOME TO</Text>
          <Text style={styles.headerTitle}>RAWSPORTS <Text style={styles.redText}>LIVE</Text></Text>
        </View>
        <Zap color="#ff0000" fill="#ff0000" size={24} />
      </View>

      {/* Live Scores Title & Carousel */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.liveIndicatorRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.sectionTitle}>Live Arena</Text>
        </View>
        <Text style={styles.viewAllText}>Real-Time Updates</Text>
      </View>

      {scoresLoading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator color="#ff0000" size="small" />
        </View>
      ) : scoresError || !liveMatches || liveMatches.length === 0 ? (
        <View style={styles.emptyScoresContainer}>
          <Compass color="#555" size={24} />
          <Text style={styles.emptyScoresText}>No live matches right now. Check schedules!</Text>
        </View>
      ) : (
        <View>
          {liveMatches.map((match: any) => (
            <LiveScoreCard 
              key={match.id} 
              match={match} 
              isFavorite={isFavorite(match.id)}
              onToggleFavorite={() => toggleFavorite(match.id)}
            />
          ))}
        </View>
      )}

      {/* Category Pills (Football, Cricket, etc.) */}
      <SportsCategoryTabs activeSport={activeSport} onSelect={setActiveSport} />

      {/* News & Official Highlights section */}
      <View style={styles.newsSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.liveIndicatorRow}>
            <Award color="#ff0000" size={16} />
            <Text style={styles.sectionTitle}>Official Highlights & Feeds</Text>
          </View>
        </View>

        {activeNews.length === 0 ? (
          <View style={styles.emptyNewsContainer}>
            <ShieldAlert color="#555" size={32} />
            <Text style={styles.emptyNewsText}>No news feeds currently available.</Text>
          </View>
        ) : (
          <View style={styles.newsGrid}>
            {activeNews.map((item) => (
              <NewsHighlightCard 
                key={item.id}
                item={item}
                onPress={() => console.log('Opening official URL:', item.url)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerSubtitle: {
    color: '#666',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  redText: {
    color: '#ff0000',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAllText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
  },
  centerLoader: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScoresContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    gap: 6,
  },
  emptyScoresText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  newsSection: {
    marginTop: 8,
    paddingBottom: 24,
  },
  newsGrid: {
    marginTop: 8,
  },
  emptyNewsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyNewsText: {
    color: '#666',
    fontSize: 13,
    fontWeight: 'bold',
  }
});
