import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  LayoutAnimation, 
  Platform, 
  UIManager
} from 'react-native';
import { ChevronDown, ChevronUp, Activity, Award } from 'lucide-react-native';
import { LiveMatch } from '../services/sportsApi';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

interface LiveScoreCardProps {
  match: LiveMatch;
}

export const LiveScoreCard: React.FC<LiveScoreCardProps> = ({ match }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getSportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'football': return '#00ff66';
      case 'cricket': return '#ffaa00';
      case 'basketball': return '#ff5500';
      case 'ufc': return '#FFBF00';
      case 'f1': return '#00ccff';
      case 'tennis': return '#dfff00';
      default: return '#ff0055';
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.sportBadge, { backgroundColor: getSportBadgeColor(match.sport) + '20' }]}>
            <Text style={[styles.sportText, { color: getSportBadgeColor(match.sport) }]}>
              {match.sport.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.leagueText} numberOfLines={1}>
            {match.league}
          </Text>
        </View>

        <View style={styles.statusRow}>
          {match.status === 'live' && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {match.timer && (
            <Text style={styles.timerText}>{match.timer}</Text>
          )}
        </View>
      </View>

      {/* Main Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Home Team */}
        <View style={styles.teamContainer}>
          {match.teamHome.logo ? (
            <Image source={{ uri: match.teamHome.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}><Text style={styles.logoLetter}>{match.teamHome.name[0]}</Text></View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>{match.teamHome.name}</Text>
          {match.teamHome.detail && (
            <Text style={styles.teamDetail}>{match.teamHome.detail}</Text>
          )}
        </View>

        {/* Scores */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{match.teamHome.score || '0'}</Text>
          <Text style={styles.scoreDivider}>-</Text>
          <Text style={styles.scoreText}>{match.teamAway.score || '0'}</Text>
        </View>

        {/* Away Team */}
        <View style={styles.teamContainer}>
          {match.teamAway.logo ? (
            <Image source={{ uri: match.teamAway.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}><Text style={styles.logoLetter}>{match.teamAway.name[0]}</Text></View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>{match.teamAway.name}</Text>
          {match.teamAway.detail && (
            <Text style={styles.teamDetail}>{match.teamAway.detail}</Text>
          )}
        </View>
      </View>

      {/* Expand/Collapse Button */}
      <TouchableOpacity 
        style={styles.expandButton} 
        activeOpacity={0.8}
        onPress={toggleExpand}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Hide Match Details' : 'View Stats & Live Timeline'}
        </Text>
        {expanded ? <ChevronUp color="#888888" size={16} /> : <ChevronDown color="#888888" size={16} />}
      </TouchableOpacity>

      {/* Expandable Panel */}
      {expanded && (
        <View style={styles.detailPanel}>
          {/* Dynamic Match Stats */}
          {match.stats && match.stats.length > 0 && (
            <View style={styles.statsSection}>
              <View style={styles.sectionHeader}>
                <Activity color="#FFBF00" size={14} />
                <Text style={styles.sectionTitle}>MATCH TELEMETRY</Text>
              </View>
              {match.stats.map((stat, i) => (
                <View key={i} style={styles.statRow}>
                  <Text style={styles.statValLeft}>{stat.home}</Text>
                  <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
                  <Text style={styles.statValRight}>{stat.away}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dynamic Match Events Timeline */}
          {match.events && match.events.length > 0 && (
            <View style={styles.eventsSection}>
              <View style={styles.sectionHeader}>
                <Award color="#FFBF00" size={14} />
                <Text style={styles.sectionTitle}>LIVE TIMELINE</Text>
              </View>
              {match.events.map((ev, i) => (
                <View key={i} style={styles.eventRow}>
                  <Text style={styles.eventTime}>{ev.time}</Text>
                  <View style={styles.eventDot} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{ev.player} ({ev.type.toUpperCase()})</Text>
                    {ev.detail && <Text style={styles.eventDesc}>{ev.detail}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {match.venue && (
            <View style={styles.venueContainer}>
              <Text style={styles.venueText}>📍 Venue: {match.venue}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  sportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sportText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  leagueText: {
    color: '#6a6a6a',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5091420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E50914',
  },
  liveText: {
    color: '#E50914',
    fontSize: 9,
    fontWeight: '900',
  },
  timerText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '900',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  teamContainer: {
    alignItems: 'center',
    width: width * 0.28,
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0ece4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoLetter: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamName: {
    color: '#121212',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamDetail: {
    color: '#6a6a6a',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  scoreText: {
    color: '#121212',
    fontSize: 32,
    fontWeight: '900',
  },
  scoreDivider: {
    color: '#aaaaaa',
    fontSize: 24,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 6,
  },
  expandText: {
    color: '#6a6a6a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailPanel: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#E50914',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statsSection: {
    backgroundColor: '#f5f1e8',
    padding: 12,
    borderRadius: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statValLeft: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
    width: 40,
  },
  statLabel: {
    color: '#6a6a6a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValRight: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 40,
  },
  eventsSection: {
    backgroundColor: '#f5f1e8',
    padding: 12,
    borderRadius: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  eventTime: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '900',
    width: 50,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E50914',
    marginHorizontal: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDesc: {
    color: '#6a6a6a',
    fontSize: 10,
    marginTop: 2,
  },
  venueContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  venueText: {
    color: '#6a6a6a',
    fontSize: 11,
    fontWeight: '500',
  },
});
