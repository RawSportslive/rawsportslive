import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, DimensionValue } from 'react-native';
import { Shield, ChevronDown, ChevronUp, Activity, BarChart2, Star } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LiveMatchProps {
  match: {
    id: string;
    sport: string;
    league: string;
    status: 'live' | 'upcoming' | 'finished';
    timer?: string;
    teamHome: { name: string; logo: string; score: string; detail?: string };
    teamAway: { name: string; logo: string; score: string; detail?: string };
    venue?: string;
    stats?: { label: string; home: number | string; away: number | string }[];
    events?: { time: string; type: string; player: string; detail?: string }[];
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const LiveScoreCard: React.FC<LiveMatchProps> = ({ match, isFavorite, onToggleFavorite }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getEventColor = (type: string) => {
    if (type === 'goal' || type === 'milestone') return '#ff0000';
    if (type === 'wicket') return '#d97706';
    if (type === 'yellow') return '#eab308';
    return '#888';
  };

  return (
    <View style={styles.card}>
      {/* Top row: League and Status Indicator */}
      <View style={styles.header}>
        <Text style={styles.leagueText}>{match.league}</Text>
        <View style={styles.liveBadgeContainer}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.liveTimerText}>
            {match.status === 'live' ? match.timer || 'LIVE' : match.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Main Score Area */}
      <View style={styles.scoreRow}>
        {/* Home Team */}
        <View style={styles.teamContainer}>
          {match.teamHome.logo ? (
            <Image 
              source={{ uri: match.teamHome.logo }} 
              style={styles.teamLogo} 
              resizeMode="contain"
            />
          ) : (
            <Shield color="#888" size={32} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{match.teamHome.name}</Text>
          {match.teamHome.detail && (
            <Text style={styles.teamDetail}>{match.teamHome.detail}</Text>
          )}
        </View>

        {/* Score Board */}
        <View style={styles.scoreDisplayContainer}>
          <Text style={styles.scoreText}>
            {match.teamHome.score} — {match.teamAway.score}
          </Text>
          {match.venue && (
            <Text style={styles.venueText} numberOfLines={1}>{match.venue}</Text>
          )}
        </View>

        {/* Away Team */}
        <View style={styles.teamContainer}>
          {match.teamAway.logo ? (
            <Image 
              source={{ uri: match.teamAway.logo }} 
              style={styles.teamLogo} 
              resizeMode="contain"
            />
          ) : (
            <Shield color="#888" size={32} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{match.teamAway.name}</Text>
          {match.teamAway.detail && (
            <Text style={styles.teamDetail}>{match.teamAway.detail}</Text>
          )}
        </View>
      </View>

      {/* Action buttons (Favorites toggle & Expand stats) */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.favButton}
          onPress={onToggleFavorite}
          activeOpacity={0.7}
        >
          <Star 
            color={isFavorite ? '#ff0000' : '#888'} 
            fill={isFavorite ? '#ff0000' : 'transparent'} 
            size={18} 
          />
          <Text style={[styles.favText, isFavorite && styles.activeFavText]}>
            {isFavorite ? 'Favorited' : 'Add Favorite'}
          </Text>
        </TouchableOpacity>

        {(match.stats || match.events) && (
          <TouchableOpacity 
            style={styles.expandButton} 
            onPress={toggleExpand}
            activeOpacity={0.7}
          >
            <BarChart2 color="#ff0000" size={16} />
            <Text style={styles.expandButtonText}>
              {expanded ? 'Hide Stats' : 'View Stats'}
            </Text>
            {expanded ? <ChevronUp color="#ff0000" size={16} /> : <ChevronDown color="#ff0000" size={16} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded Match Details (Statistics & Timeline events) */}
      {expanded && (
        <View style={styles.detailsContainer}>
          {/* Match events timeline */}
          {match.events && match.events.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Incidents</Text>
              {match.events.map((event, index) => (
                <View key={index} style={styles.eventRow}>
                  <View style={[styles.eventBadge, { backgroundColor: getEventColor(event.type) }]}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventPlayer}>{event.player}</Text>
                    {event.detail && <Text style={styles.eventDetailText}>{event.detail}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Match statistics comparison */}
          {match.stats && match.stats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Match Stats</Text>
              {match.stats.map((stat, index) => (
                <View key={index} style={styles.statContainer}>
                  <View style={styles.statLabelRow}>
                    <Text style={styles.statValueText}>{stat.home}</Text>
                    <Text style={styles.statLabelText}>{stat.label}</Text>
                    <Text style={styles.statValueText}>{stat.away}</Text>
                  </View>
                  {/* Bar graph comparison */}
                  <View style={styles.barGraphContainer}>
                    <View style={styles.barBackground}>
                      <View style={[styles.barHome, { width: (stat.label === 'Possession' ? stat.home : '50%') as DimensionValue }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 10,
    marginBottom: 12,
  },
  leagueText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff0000',
    marginRight: 6,
  },
  liveTimerText: {
    color: '#ff0000',
    fontWeight: '800',
    fontSize: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  teamContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogo: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  teamName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  teamDetail: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  scoreDisplayContainer: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scoreText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 26,
    letterSpacing: -1,
  },
  venueText: {
    color: '#666',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 12,
    marginTop: 12,
  },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFavText: {
    color: '#ff0000',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButtonText: {
    color: '#ff0000',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181818',
    padding: 8,
    borderRadius: 8,
  },
  eventBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventTime: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventPlayer: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  eventDetailText: {
    color: '#888',
    fontSize: 10,
  },
  statContainer: {
    gap: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statLabelText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
  },
  barGraphContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barBackground: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  barHome: {
    height: '100%',
    backgroundColor: '#ff0000',
  }
});
