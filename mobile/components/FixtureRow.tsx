import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Calendar, MapPin, Shield } from 'lucide-react-native';

interface FixtureProps {
  fixture: {
    id: string;
    sport: string;
    league: string;
    date: string; // ISO string
    teamHome: { name: string; logo: string };
    teamAway: { name: string; logo: string };
    venue?: string;
  };
}

export const FixtureRow: React.FC<FixtureProps> = ({ fixture }) => {
  // Timezone support - converts ISO to local phone date & time
  const matchDate = new Date(fixture.date);
  
  const formattedTime = matchDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
  
  const formattedDate = matchDate.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <View style={styles.container}>
      {/* Top Section: League & Date */}
      <View style={styles.header}>
        <Text style={styles.leagueText}>{fixture.league}</Text>
        <View style={styles.dateBadge}>
          <Calendar color="#ff0000" size={12} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Main Teams Matchup Row */}
      <View style={styles.matchupRow}>
        {/* Home Team */}
        <View style={styles.team}>
          {fixture.teamHome.logo ? (
            <Image 
              source={{ uri: fixture.teamHome.logo }} 
              style={styles.logo} 
              resizeMode="contain"
            />
          ) : (
            <Shield color="#888" size={24} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{fixture.teamHome.name}</Text>
        </View>

        {/* Kickoff Time Badge */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        </View>

        {/* Away Team */}
        <View style={styles.team}>
          {fixture.teamAway.logo ? (
            <Image 
              source={{ uri: fixture.teamAway.logo }} 
              style={styles.logo} 
              resizeMode="contain"
            />
          ) : (
            <Shield color="#888" size={24} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{fixture.teamAway.name}</Text>
        </View>
      </View>

      {/* Venue Information (Optional) */}
      {fixture.venue && (
        <View style={styles.venueRow}>
          <MapPin color="#555" size={12} />
          <Text style={styles.venueText} numberOfLines={1}>{fixture.venue}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
    paddingBottom: 8,
  },
  leagueText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateText: {
    color: '#a3a3a3',
    fontWeight: '700',
    fontSize: 10,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  team: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 32,
    height: 32,
  },
  teamName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    gap: 4,
  },
  timeText: {
    color: '#ff0000',
    fontWeight: '800',
    fontSize: 13,
  },
  vsBadge: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  vsText: {
    color: '#666',
    fontWeight: '900',
    fontSize: 8,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#1a1a1c',
  },
  venueText: {
    color: '#555',
    fontSize: 10,
    fontWeight: '600',
  }
});
