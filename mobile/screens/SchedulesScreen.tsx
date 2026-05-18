import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFixtures, useStandings } from '../hooks/useSportsData';
import { SportsCategoryTabs, SportCategory } from '../components/SportsCategoryTabs';
import { FixtureRow } from '../components/FixtureRow';
import { StandingTable } from '../components/StandingTable';
import { Calendar, BarChart3, Search, CalendarDays } from 'lucide-react-native';

export const SchedulesScreen: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportCategory>('football');
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'standings'>('fixtures');
  const [refreshing, setRefreshing] = useState(false);

  // Queries using react-query caching
  const { 
    data: fixtures, 
    isLoading: fixturesLoading, 
    refetch: refetchFixtures 
  } = useFixtures(activeSport);

  const { 
    data: standings, 
    isLoading: standingsLoading, 
    refetch: refetchStandings 
  } = useStandings(activeSport);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeSubTab === 'fixtures') {
      await refetchFixtures();
    } else {
      await refetchStandings();
    }
    setRefreshing(false);
  };

  const isLoading = activeSubTab === 'fixtures' ? fixturesLoading : standingsLoading;

  return (
    <View style={styles.container}>
      {/* Top bar: Sub-Tabs */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity 
          style={[styles.subTabButton, activeSubTab === 'fixtures' && styles.activeSubTabButton]}
          onPress={() => setActiveSubTab('fixtures')}
          activeOpacity={0.7}
        >
          <Calendar color={activeSubTab === 'fixtures' ? '#ffffff' : '#888'} size={16} />
          <Text style={[styles.subTabText, activeSubTab === 'fixtures' && styles.activeSubTabText]}>
            Calendar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.subTabButton, activeSubTab === 'standings' && styles.activeSubTabButton]}
          onPress={() => setActiveSubTab('standings')}
          activeOpacity={0.7}
        >
          <BarChart3 color={activeSubTab === 'standings' ? '#ffffff' : '#888'} size={16} />
          <Text style={[styles.subTabText, activeSubTab === 'standings' && styles.activeSubTabText]}>
            Standings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#ff0000"
            colors={['#ff0000']}
          />
        }
      >
        {/* Sport pills filter */}
        <SportsCategoryTabs activeSport={activeSport} onSelect={setActiveSport} />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#ff0000" size="large" style={{ marginTop: 40 }} />
            <Text style={styles.loadingText}>Fetching official data...</Text>
          </View>
        ) : activeSubTab === 'fixtures' ? (
          // Render upcoming fixtures
          !fixtures || fixtures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CalendarDays color="#444" size={48} />
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>There are no matches scheduled for {activeSport} in the coming days.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {fixtures.map((fx: any) => (
                <FixtureRow key={fx.id} fixture={fx} />
              ))}
            </View>
          )
        ) : (
          // Render league points tables / standings
          !standings || standings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BarChart3 color="#444" size={48} />
              <Text style={styles.emptyTitle}>No Standings Found</Text>
              <Text style={styles.emptyText}>Points standings are currently unranked or in off-season for {activeSport}.</Text>
            </View>
          ) : (
            <StandingTable standings={standings} sport={activeSport} />
          )
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
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    padding: 6,
    gap: 6,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeSubTabButton: {
    backgroundColor: '#ff0000',
  },
  subTabText: {
    color: '#888',
    fontWeight: '700',
    fontSize: 13,
  },
  activeSubTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
    gap: 12,
    marginHorizontal: 24,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  }
});
