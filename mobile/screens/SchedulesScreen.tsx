import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SportsSelector } from '../components/SportsSelector';
import { useFixtures, useStandings } from '../hooks/useSportsData';
import { Calendar, Award, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const SchedulesScreen = () => {
  const [activeSport, setActiveSport] = useState('football');
  const [subTab, setSubTab] = useState<'fixtures' | 'standings'>('fixtures');

  const { data: fixtures = [], isLoading: loadingFixtures, refetch: refetchFixtures } = useFixtures(activeSport);
  const { data: standings = [], isLoading: loadingStandings, refetch: refetchStandings } = useStandings(activeSport);

  const isLoading = subTab === 'fixtures' ? loadingFixtures : loadingStandings;

  const handleRefresh = async () => {
    if (subTab === 'fixtures') {
      await refetchFixtures();
    } else {
      await refetchStandings();
    }
  };

  const getFormDotColor = (char: string) => {
    if (char === 'W') return '#00ff66';
    if (char === 'D') return '#888888';
    return '#ff0033';
  };

  return (
    <View style={styles.container}>
      {/* Title Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SCHEDULES & STANDINGS</Text>
        <Text style={styles.headerSubtitle}>COMPETITIONS ARENA</Text>
      </View>

      {/* Sports Tab Selector */}
      <SportsSelector activeSport={activeSport} onSelect={setActiveSport} />

      {/* Sub-Navigation Switcher (Fixtures vs Standings) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setSubTab('fixtures')}
          style={[styles.tab, subTab === 'fixtures' ? styles.activeTab : styles.inactiveTab]}
          activeOpacity={0.8}
        >
          <Calendar color={subTab === 'fixtures' ? '#ffffff' : '#666666'} size={14} />
          <Text style={[styles.tabText, subTab === 'fixtures' ? styles.activeTabText : styles.inactiveTabText]}>
            FIXTURES CALENDAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubTab('standings')}
          style={[styles.tab, subTab === 'standings' ? styles.activeTab : styles.inactiveTab]}
          activeOpacity={0.8}
        >
          <Award color={subTab === 'standings' ? '#ffffff' : '#666666'} size={14} />
          <Text style={[styles.tabText, subTab === 'standings' ? styles.activeTabText : styles.inactiveTabText]}>
            LEAGUE TABLE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#E50914" size="large" />
          <Text style={styles.loadingText}>Fetching arena data...</Text>
        </View>
      ) : subTab === 'fixtures' ? (
        /* FIXTURES CALENDAR VIEW */
        <FlatList
          data={fixtures}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loadingFixtures}
              onRefresh={handleRefresh}
              tintColor="#E50914"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.fixtureCard}>
              <View style={styles.fixtureHeader}>
                <Text style={styles.fixtureLeague}>{item.league}</Text>
                <Text style={styles.fixtureTime}>
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.fixtureMain}>
                {/* Home */}
                <View style={styles.fixtureTeam}>
                  {item.teamHome.logo ? (
                    <Image source={{ uri: item.teamHome.logo }} style={styles.teamLogo} />
                  ) : (
                    <View style={styles.logoPlaceholder}><Text style={styles.logoLetter}>{item.teamHome.name[0]}</Text></View>
                  )}
                  <Text style={styles.teamName} numberOfLines={1}>{item.teamHome.name}</Text>
                </View>

                {/* VS Divider */}
                <View style={styles.vsBox}>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.dateLabel}>
                    {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                </View>

                {/* Away */}
                <View style={styles.fixtureTeam}>
                  {item.teamAway.logo ? (
                    <Image source={{ uri: item.teamAway.logo }} style={styles.teamLogo} />
                  ) : (
                    <View style={styles.logoPlaceholder}><Text style={styles.logoLetter}>{item.teamAway.name[0]}</Text></View>
                  )}
                  <Text style={styles.teamName} numberOfLines={1}>{item.teamAway.name}</Text>
                </View>
              </View>

              {item.venue && (
                <Text style={styles.venueText}>📍 Venue: {item.venue}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyHeader}>NO UPCOMING MATCHES</Text>
              <Text style={styles.emptySub}>No scheduled matches found for this category currently.</Text>
            </View>
          }
        />
      ) : (
        /* STANDINGS / RANKINGS TABLE VIEW */
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tableScroll}
        >
          {standings.length > 0 ? (
            <View style={styles.tableContainer}>
              {/* Header row */}
              <View style={styles.tableRowHeader}>
                <Text style={[styles.cellHeader, { width: 40 }]}>#</Text>
                <Text style={[styles.cellHeader, { width: 140, textAlign: 'left' }]}>TEAM / ATHLETE</Text>
                <Text style={[styles.cellHeader, { width: 40 }]}>GP</Text>
                <Text style={[styles.cellHeader, { width: 40 }]}>W</Text>
                {activeSport === 'football' && <Text style={[styles.cellHeader, { width: 40 }]}>D</Text>}
                <Text style={[styles.cellHeader, { width: 40 }]}>L</Text>
                <Text style={[styles.cellHeader, { width: 50, color: '#E50914' }]}>PTS</Text>
                <Text style={[styles.cellHeader, { width: 100 }]}>FORM</Text>
              </View>

              {/* Data rows */}
              {standings.map((team, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.cellText, { width: 40, fontWeight: '900' }]}>{team.rank}</Text>
                  
                  <View style={[styles.teamCell, { width: 140 }]}>
                    {team.team.logo ? (
                      <Image source={{ uri: team.team.logo }} style={styles.smallLogo} />
                    ) : (
                      <View style={styles.smallLogoPlaceholder} />
                    )}
                    <Text style={styles.teamNameText} numberOfLines={1}>{team.team.name}</Text>
                  </View>

                  <Text style={[styles.cellText, { width: 40 }]}>{team.played}</Text>
                  <Text style={[styles.cellText, { width: 40 }]}>{team.won}</Text>
                  {activeSport === 'football' && <Text style={[styles.cellText, { width: 40 }]}>{team.drawn ?? 0}</Text>}
                  <Text style={[styles.cellText, { width: 40 }]}>{team.lost}</Text>
                  <Text style={[styles.cellText, { width: 50, color: '#ffffff', fontWeight: '900' }]}>{team.points}</Text>
                  
                  {/* Form Dots */}
                  <View style={[styles.formCell, { width: 100 }]}>
                    {(team.form || '').split('').slice(0, 5).map((char, i) => (
                      <View 
                        key={i} 
                        style={[styles.formDot, { backgroundColor: getFormDotColor(char) }]} 
                      >
                        <Text style={styles.formLetter}>{char}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { width: width - 40, marginTop: 40 }]}>
              <Text style={styles.emptyHeader}>NO STANDINGS FOUND</Text>
              <Text style={styles.emptySub}>Rankings are not applicable or currently unavailable for this sport.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 36,
    paddingBottom: 12,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#151515',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#aaaaaa',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E50914',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#666666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fixtureCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    borderColor: '#222222',
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  fixtureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingBottom: 8,
    marginBottom: 12,
  },
  fixtureLeague: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '900',
  },
  fixtureTime: {
    color: '#888888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fixtureMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fixtureTeam: {
    alignItems: 'center',
    width: width * 0.28,
  },
  teamLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoLetter: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  dateLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  venueText: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  tableScroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tableContainer: {
    backgroundColor: '#121212',
    borderColor: '#222222',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  cellHeader: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  cellText: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  smallLogoPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#222222',
  },
  teamNameText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  formCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
  formDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formLetter: {
    color: '#050505',
    fontSize: 8,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptySub: {
    color: '#666666',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
