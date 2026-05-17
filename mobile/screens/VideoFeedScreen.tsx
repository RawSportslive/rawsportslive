import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  SafeAreaView, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  TextInput, 
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  where,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import YoutubePlayer from 'react-native-youtube-iframe';
import { X, Search, Play, Trophy, Calendar } from 'lucide-react-native';

import { db } from '../firebaseConfig';
import { CategoryTabs } from '../components/CategoryTabs';
import { VideoCard } from '../components/VideoCard';
import { SkeletonLoader } from '../components/SkeletonLoader';

import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');
const PAGE_SIZE = 6;

export const VideoFeedScreen = () => {
  const [activeCategory, setActiveCategory] = useState('Latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Auto rotate to landscape when a video is selected (fullscreen), and portrait when closed
  useEffect(() => {
    async function changeOrientation() {
      if (selectedVideo) {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } catch (e) {
          console.log("ScreenOrientation landscape lock error:", e);
        }
      } else {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } catch (e) {
          console.log("ScreenOrientation portrait lock error:", e);
        }
      }
    }
    changeOrientation();
  }, [selectedVideo]);
  
  // Data states
  const [videos, setVideos] = useState<any[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Caching last document for pagination
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Fetch initial videos
  const fetchInitialData = async (category = activeCategory, search = searchQuery) => {
    setIsLoading(true);
    try {
      // 1. Fetch Featured Videos for Carousel (always latest 5 WWE videos)
      const featuredQuery = query(
        collection(db, 'youtube_videos'), 
        orderBy('publishedAt', 'desc'), 
        limit(5)
      );
      const featuredSnap = await getDocs(featuredQuery);
      setFeaturedVideos(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. Fetch main feed videos
      let q = query(
        collection(db, 'youtube_videos'),
        orderBy('publishedAt', 'desc'),
        limit(PAGE_SIZE)
      );

      // If a category other than 'Latest' is selected, filter by it
      if (category !== 'Latest') {
        q = query(
          collection(db, 'youtube_videos'),
          where('categories', 'array-contains', category),
          orderBy('publishedAt', 'desc'),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);
      
      let fetchedVideos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Client-side search filtering
      if (search.trim() !== '') {
        fetchedVideos = fetchedVideos.filter(video => 
          video.title.toLowerCase().includes(search.toLowerCase()) || 
          video.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      setVideos(fetchedVideos);
      
      if (snap.docs.length > 0) {
        lastDocRef.current = snap.docs[snap.docs.length - 1];
        setHasMore(snap.docs.length === PAGE_SIZE);
      } else {
        lastDocRef.current = null;
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch next page for infinite scroll
  const fetchNextPage = async () => {
    if (isLoadingMore || !hasMore || !lastDocRef.current) return;

    setIsLoadingMore(true);
    try {
      let q = query(
        collection(db, 'youtube_videos'),
        orderBy('publishedAt', 'desc'),
        startAfter(lastDocRef.current),
        limit(PAGE_SIZE)
      );

      if (activeCategory !== 'Latest') {
        q = query(
          collection(db, 'youtube_videos'),
          where('categories', 'array-contains', activeCategory),
          orderBy('publishedAt', 'desc'),
          startAfter(lastDocRef.current),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);
      let newVideos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (searchQuery.trim() !== '') {
        newVideos = newVideos.filter(video => 
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          video.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setVideos(prev => [...prev, ...newVideos]);

      if (snap.docs.length > 0) {
        lastDocRef.current = snap.docs[snap.docs.length - 1];
        setHasMore(snap.docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInitialData(activeCategory, searchQuery);
    setIsRefreshing(false);
  };

  // Trigger fetch when category or search changes
  useEffect(() => {
    fetchInitialData(activeCategory, searchQuery);
  }, [activeCategory]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setSelectedVideo(null);
    }
  }, []);

  // Header Carousel Component
  const renderHeader = () => {
    if (featuredVideos.length === 0 || activeCategory !== 'Latest' || searchQuery !== '') return null;

    return (
      <View style={styles.carouselContainer}>
        <View style={styles.sectionHeader}>
          <Trophy color="#ff0000" size={18} />
          <Text style={styles.sectionTitle}>FEATURED MATCHES</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.85 + 15}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        >
          {featuredVideos.map((video) => (
            <TouchableOpacity 
              key={video.id} 
              style={styles.carouselCard} 
              activeOpacity={0.9}
              onPress={() => setSelectedVideo(video)}
            >
              <Image source={{ uri: video.thumbnail }} style={styles.carouselImage} />
              <View style={styles.carouselPlayOverlay}>
                <View style={styles.smallPlayButton}>
                  <Play color="#fff" size={16} fill="#fff" />
                </View>
              </View>
              <View style={styles.carouselFooter}>
                <Text style={styles.carouselTitle} numberOfLines={2}>{video.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.divider} />
        <View style={styles.sectionHeader}>
          <Calendar color="#ff0000" size={18} />
          <Text style={styles.sectionTitle}>LATEST UPLOADS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RAWSPORTS LIVE</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WWE</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search color="#666" size={18} />
          <TextInput
            placeholder="Search WWE video highlights..."
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchInitialData(activeCategory, searchQuery)}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchInitialData(activeCategory, ''); }}>
              <X color="#666" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Category Tabs */}
      <View>
        <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
      </View>

      {isLoading ? (
        <View style={styles.listContainer}>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <VideoCard 
              video={item} 
              onPress={() => setSelectedVideo(item)} 
            />
          )}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh}
              tintColor="#ff0000"
            />
          }
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color="#ff0000" style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No WWE videos match your search.</Text>
            </View>
          }
        />
      )}

      {/* Video Player Modal */}
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedVideo(null)}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>
          
          {selectedVideo && (
            <View style={styles.playerWrapper}>
              <YoutubePlayer
                height={width * 0.5625}
                width={width}
                play={true}
                videoId={selectedVideo.videoId}
                onChangeState={onStateChange}
              />
              <ScrollView style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedVideo.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.channelLabel}>WWE Official Channel</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.dateLabel}>
                    {new Date(selectedVideo.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.modalDesc}>{selectedVideo.description}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '950',
    fontStyle: 'italic',
    letterSpacing: 1.5,
  },
  badge: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#252525',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  carouselContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  carouselContent: {
    gap: 15,
    paddingRight: 20,
  },
  carouselCard: {
    width: width * 0.85,
    height: width * 0.52,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  carouselPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  smallPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  carouselTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#151515',
    marginVertical: 20,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerWrapper: {
    flex: 1,
    marginTop: 100,
  },
  modalInfo: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  channelLabel: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaDivider: {
    color: '#444',
    marginHorizontal: 8,
  },
  dateLabel: {
    color: '#666',
    fontSize: 12,
  },
  modalDesc: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  }
});
