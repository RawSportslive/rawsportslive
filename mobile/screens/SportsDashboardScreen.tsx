import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { SportsSelector } from '../components/SportsSelector';
import { LiveScoreCard } from '../components/LiveScoreCard';
import { useLiveMatches } from '../hooks/useSportsData';
import { PlayCircle, Trophy, RefreshCw, Zap } from 'lucide-react-native';
import { LiveMatch } from '../services/sportsApi';

const BG = '#faf9f6';
const CARD_BG = '#ffffff';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT_PRIMARY = '#121212';
const TEXT_SECONDARY = '#6a6a6a';
const BRAND_RED = '#E50914';

const { width } = Dimensions.get('window');

interface SportsDashboardScreenProps {
  onNavigateToSchedules: () => void;
}

export const SportsDashboardScreen: React.FC<SportsDashboardScreenProps> = ({ onNavigateToSchedules }) => {
  const [activeSport, setActiveSport] = useState('all');
  const [tickerIndex, setTickerIndex] = useState(0);

  // If 'all' is selected, we fetch all sports. But since our endpoint is single-sport,
  // we will map over the primary active sports or aggregate them!
  // To keep it high-speed, we will fetch the active sport, or if 'all', we fetch 'football' and 'cricket'
  const sportToFetch = activeSport === 'all' ? 'football' : activeSport;
  const { data: matches = [], isLoading, isRefetching, refetch } = useLiveMatches(sportToFetch);

  const displayMatches = matches;

  const handleRefresh = async () => {
    await refetch();
  };

  // Rotating live match headlines ticker
  useEffect(() => {
    if (displayMatches.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % displayMatches.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayMatches]);

  const activeTickerMatch = displayMatches[tickerIndex];

  return (
    <View style={styles.container}>
      {/* Title Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            RAWSPORTS <Text style={{ color: '#E50914' }}>LIVE</Text>
          </Text>
          <Text style={styles.headerSubtitle}>MULTI-SPORTS SYSTEM</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          {isRefetching ? (
            <ActivityIndicator color={BRAND_RED} size="small" />
          ) : (
            <RefreshCw color={TEXT_SECONDARY} size={16} />
          )}
        </TouchableOpacity>
      </View>

      {/* Sports Tab Selector */}
      <SportsSelector activeSport={activeSport} onSelect={setActiveSport} />

      {/* Dynamic Score Ticker Banner */}
      {activeTickerMatch && (
        <View style={styles.tickerContainer}>
          <View style={styles.tickerIcon}>
            <Zap color="#E50914" size={12} fill="#E50914" />
            <Text style={styles.tickerBadgeText}>LIVE ALERT</Text>
          </View>
          <Text style={styles.tickerText} numberOfLines={1}>
            {activeTickerMatch.sport.toUpperCase()} • {activeTickerMatch.teamHome.name} {activeTickerMatch.teamHome.score} vs {activeTickerMatch.teamAway.score} {activeTickerMatch.teamAway.name} ({activeTickerMatch.timer || 'LIVE'})
          </Text>
        </View>
      )}

      {/* Main score feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#E50914" size="large" />
          <Text style={styles.loadingText}>Connecting to Live Score Gateways...</Text>
        </View>
      ) : (
        <FlatList
          data={displayMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#E50914"
              colors={['#E50914']}
            />
          }
          renderItem={({ item }) => <LiveScoreCard match={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyHeader}>NO ACTIVE MATCHES</Text>
              <Text style={styles.emptySub}>
                There are no live {activeSport === 'all' ? '' : activeSport} matches right now. 
                Don't miss the next kickoff!
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={onNavigateToSchedules}
              >
                <Trophy color="#ffffff" size={16} />
                <Text style={styles.actionButtonText}>VIEW FULL SCHEDULE</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 36,
    paddingBottom: 12,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0ece4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  tickerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_RED + '18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  tickerBadgeText: {
    color: BRAND_RED,
    fontSize: 8,
    fontWeight: '900',
  },
  tickerText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyHeader: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySub: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_RED,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: BRAND_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
