import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Play, Newspaper, Share2, Calendar, ShieldCheck } from 'lucide-react-native';

interface NewsHighlightProps {
  item: {
    id: string;
    type: 'news' | 'highlight';
    title: string;
    summary?: string;
    thumbnail: string;
    source: string;
    date: string;
    url: string; // Official link / video URL
  };
  onPress: () => void;
}

export const NewsHighlightCard: React.FC<NewsHighlightProps> = ({ item, onPress }) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n\nRead more on RawSports Live: ${item.url}`,
      });
    } catch (error) {
      console.error('Error sharing sports item:', error);
    }
  };

  const formattedDate = new Date(item.date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Header with Badge Overlay */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={[
          styles.badge, 
          { backgroundColor: item.type === 'highlight' ? '#ff0000' : '#1e1b4b' }
        ]}>
          {item.type === 'highlight' ? (
            <Play color="#ffffff" size={10} fill="#ffffff" />
          ) : (
            <Newspaper color="#ffffff" size={10} />
          )}
          <Text style={styles.badgeText}>
            {item.type === 'highlight' ? 'OFFICIAL HIGHLIGHT' : 'OFFICIAL NEWS'}
          </Text>
        </View>

        {/* Video Play Overlay */}
        {item.type === 'highlight' && (
          <View style={styles.playOverlay}>
            <View style={styles.playButtonCircle}>
              <Play color="#ffffff" size={18} fill="#ffffff" style={{ marginLeft: 3 }} />
            </View>
          </View>
        )}
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.summary && (
          <Text style={styles.summary} numberOfLines={2}>
            {item.summary}
          </Text>
        )}

        {/* Footer: Date, Source, Share Button */}
        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <View style={styles.sourceBadge}>
              <ShieldCheck color="#ff0000" size={10} />
              <Text style={styles.sourceText}>{item.source}</Text>
            </View>
            <View style={styles.dividerDot} />
            <View style={styles.dateBadge}>
              <Calendar color="#888" size={10} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 color="#888" size={14} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  summary: {
    color: '#a3a3a3',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#222',
    paddingTop: 12,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    color: '#d4d4d4',
    fontSize: 10,
    fontWeight: '700',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  shareButton: {
    padding: 4,
  }
});
