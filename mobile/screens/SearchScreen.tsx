import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSportsSearch } from '../hooks/useSportsData';
import { Search, X, Compass, Activity, ArrowRight, Shield } from 'lucide-react-native';

const POPULAR_TAGS = ['Arsenal', 'Lakers', 'Virat Kohli', 'Chelsea', 'IPL', 'UFC 312'];

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const { data: results, isLoading, isError } = useSportsSearch(query);

  const handleTagPress = (tag: string) => {
    setQuery(tag);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>DISCOVER ARENA</Text>
        <Text style={styles.title}>GLOBAL SEARCH</Text>
        
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Search color="#666" size={18} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search teams, players, leagues..."
            placeholderTextColor="#666"
            style={styles.input}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <X color="#888" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.body}>
        {query.trim().length === 0 ? (
          // Popular Suggestion Tags
          <View style={styles.suggestionSection}>
            <View style={styles.sectionHeader}>
              <Compass color="#ff0000" size={16} />
              <Text style={styles.sectionTitle}>Popular Searches</Text>
            </View>
            
            <View style={styles.tagsContainer}>
              {POPULAR_TAGS.map((tag) => (
                <TouchableOpacity 
                  key={tag}
                  style={styles.tag}
                  onPress={() => handleTagPress(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* General Discovery Tip */}
            <View style={styles.discoveryCard}>
              <Text style={styles.discoveryTitle}>Stay Notified in Real-Time</Text>
              <Text style={styles.discoveryDesc}>
                Find your favorite teams or events here, mark them as favorite, and receive live updates and match kickoff alerts instantly.
              </Text>
            </View>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color="#ff0000" size="large" style={{ marginTop: 40 }} />
        ) : isError || !results || results.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Shield color="#555" size={48} />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyDesc}>
              We couldn't find any matchups, teams, or leagues matching "{query}". Try checking your spelling or search another keyword.
            </Text>
          </View>
        ) : (
          // Search Results Grid
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeading}>SEARCH RESULTS ({results.length})</Text>
            {results.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.resultRow}
                activeOpacity={0.8}
                onPress={() => console.log('Selected search result:', item.id)}
              >
                <View style={styles.resultLeft}>
                  <View style={styles.iconCircle}>
                    <Activity color="#ff0000" size={16} />
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.resultRight}>
                  <View style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>{item.sport.toUpperCase()}</Text>
                  </View>
                  <ArrowRight color="#666" size={14} />
                </View>
              </TouchableOpacity>
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
    paddingBottom: 16,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
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
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d30',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  body: {
    flex: 1,
  },
  suggestionSection: {
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#161618',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#262628',
  },
  tagText: {
    color: '#d4d4d8',
    fontWeight: '700',
    fontSize: 12,
  },
  discoveryCard: {
    backgroundColor: 'rgba(255,0,0,0.03)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,0,0,0.15)',
    padding: 16,
    marginTop: 10,
    gap: 6,
  },
  discoveryTitle: {
    color: '#ff0000',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  discoveryDesc: {
    color: '#666',
    fontSize: 11,
    lineHeight: 16,
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
  emptyDesc: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 16,
  },
  resultsHeading: {
    color: '#666',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginBottom: 8,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1.5,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  resultSubtitle: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  resultRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sportBadge: {
    backgroundColor: '#1a1a1c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  sportBadgeText: {
    color: '#ff0000',
    fontWeight: '900',
    fontSize: 9,
  }
});
