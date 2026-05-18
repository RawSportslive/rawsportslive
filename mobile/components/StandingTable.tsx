import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Shield } from 'lucide-react-native';

interface TeamStanding {
  rank: number;
  team: { name: string; logo: string };
  played: number;
  won: number;
  drawn?: number;
  lost: number;
  points: number;
  form?: string; // e.g. "WWDLW" or "1-1-DNF"
}

interface StandingTableProps {
  standings: TeamStanding[];
  sport: string;
}

export const StandingTable: React.FC<StandingTableProps> = ({ standings, sport }) => {
  const renderFormCircle = (result: string, index: number) => {
    let backgroundColor = '#222';
    let label = result;

    if (result === 'W' || result === '1') {
      backgroundColor = '#16a34a'; // Green
      label = 'W';
    } else if (result === 'L' || result === 'DNF') {
      backgroundColor = '#dc2626'; // Red
      label = 'L';
    } else if (result === 'D' || result.includes('2') || result.includes('3') || result.includes('4') || result.includes('5')) {
      backgroundColor = '#4b5563'; // Grey
      label = result;
    }

    return (
      <View key={index} style={[styles.formCircle, { backgroundColor }]}>
        <Text style={styles.formLetter}>{label.substring(0, 1)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Table Headers */}
      <View style={styles.tableHeaderRow}>
        <View style={styles.leftColHeader}>
          <Text style={styles.headerText}>Pos</Text>
          <Text style={[styles.headerText, { marginLeft: 16 }]}>Team / Competitor</Text>
        </View>
        <View style={styles.rightColHeader}>
          <Text style={styles.headerText}>PL</Text>
          <Text style={styles.headerText}>W</Text>
          {sport === 'football' && <Text style={styles.headerText}>D</Text>}
          <Text style={styles.headerText}>{sport === 'basketball' || sport === 'cricket' ? 'L' : 'L/D'}</Text>
          <Text style={[styles.headerText, styles.pointsHeader]}>PTS</Text>
        </View>
      </View>

      {/* Standings Rows */}
      {standings.map((row) => {
        // Highlight top 4 spots with a soft green boundary, or top 1 with gold for premium feel
        const isPromoSpot = row.rank <= 4 && sport === 'football';
        
        return (
          <View key={row.rank} style={[styles.row, isPromoSpot && styles.rowPromo]}>
            {/* Left side: Position Rank & Team Details */}
            <View style={styles.leftCol}>
              <Text style={[
                styles.rankText,
                row.rank === 1 && styles.rankOne,
                row.rank === 2 && styles.rankTwo
              ]}>
                {row.rank}
              </Text>
              
              <View style={styles.teamInfo}>
                {row.team.logo ? (
                  <Image 
                    source={{ uri: row.team.logo }} 
                    style={styles.logo} 
                    resizeMode="contain"
                  />
                ) : (
                  <Shield color="#666" size={16} />
                )}
                <Text style={styles.teamNameText} numberOfLines={1}>
                  {row.team.name}
                </Text>
              </View>
            </View>

            {/* Right side: Stats Grid */}
            <View style={styles.rightCol}>
              <Text style={styles.statCell}>{row.played}</Text>
              <Text style={styles.statCell}>{row.won}</Text>
              {sport === 'football' && <Text style={styles.statCell}>{row.drawn ?? 0}</Text>}
              <Text style={styles.statCell}>{row.lost}</Text>
              <Text style={[styles.statCell, styles.pointsCell]}>{row.points}</Text>
            </View>
          </View>
        );
      })}

      {/* Form Guide (History) */}
      {standings[0]?.form && (
        <View style={styles.formFooter}>
          <Text style={styles.formFooterTitle}>Recent Form Guide:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formCirclesScroll}>
            {standings.slice(0, 3).map((item) => (
              <View key={item.rank} style={styles.formRow}>
                <Text style={styles.formRowTeam} numberOfLines={1}>{item.team.name}:</Text>
                <View style={styles.formCirclesContainer}>
                  {item.form?.split(/[-]/).join('').split('').map((char, index) => 
                    renderFormCircle(char, index)
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161618',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  leftColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  rightColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingLeft: 10,
  },
  headerText: {
    color: '#888',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    width: 24,
    textAlign: 'center',
  },
  pointsHeader: {
    color: '#ff0000',
    fontWeight: '900',
    width: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1d1d1f',
  },
  rowPromo: {
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a', // soft green promotion border
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  rankText: {
    color: '#a3a3a3',
    fontWeight: '800',
    fontSize: 12,
    width: 18,
    textAlign: 'center',
  },
  rankOne: {
    color: '#fbbf24', // Gold rank 1
  },
  rankTwo: {
    color: '#94a3b8', // Silver rank 2
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 8,
    flex: 1,
  },
  logo: {
    width: 20,
    height: 20,
  },
  teamNameText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    flex: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingLeft: 10,
  },
  statCell: {
    color: '#e5e5e5',
    fontWeight: '600',
    fontSize: 12,
    width: 24,
    textAlign: 'center',
  },
  pointsCell: {
    color: '#ffffff',
    fontWeight: '900',
    width: 32,
    fontSize: 13,
  },
  formFooter: {
    backgroundColor: '#161618',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  formFooterTitle: {
    color: '#666',
    fontWeight: '800',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  formCirclesScroll: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formRowTeam: {
    color: '#a3a3a3',
    fontWeight: '700',
    fontSize: 10,
    maxWidth: 60,
  },
  formCirclesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  formCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLetter: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 8,
    textAlign: 'center',
  }
});
