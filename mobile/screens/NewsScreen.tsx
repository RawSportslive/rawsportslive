import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
  Share,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Search,
  X,
  Calendar,
  User,
  Clock,
  Share2,
  Bookmark,
  Eye,
  Newspaper,
} from 'lucide-react-native';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const BG = '#faf9f6';
const CARD_BG = '#ffffff';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT_PRIMARY = '#121212';
const TEXT_SECONDARY = '#6a6a6a';
const BRAND_RED = '#E50914';

const { width } = Dimensions.get('window');
const newsCategories = ["All", "Saved", "RAW", "SmackDown", "Rumors", "NXT", "Events", "WWE News", "Nepal"];

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  link?: string;
  createdAt?: any;
  views?: number;
}

export const NewsScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const saved = await AsyncStorage.getItem('rawsports_saved_articles');
        if (saved) {
          setBookmarkedIds(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load bookmarks:", e);
      }
    };
    loadBookmarks();
  }, []);

  // Sync articles from Firestore
  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsArticle[];
      setArticles(newsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching news:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update views in Firestore when article is opened
  useEffect(() => {
    if (selectedArticle) {
      const updateViews = async () => {
        try {
          const viewedKey = `rawsports_viewed_${selectedArticle.id}`;
          const alreadyViewed = await AsyncStorage.getItem(viewedKey);
          if (!alreadyViewed) {
            await AsyncStorage.setItem(viewedKey, 'true');
            const articleRef = doc(db, 'news', selectedArticle.id);
            await updateDoc(articleRef, { views: increment(1) });
          }
        } catch (err) {
          console.error("Error updating views:", err);
        }
      };
      updateViews();
    }
  }, [selectedArticle]);

  const toggleBookmark = async (id: string) => {
    const newBookmarks = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(b => b !== id) 
      : [...bookmarkedIds, id];
    setBookmarkedIds(newBookmarks);
    try {
      await AsyncStorage.setItem('rawsports_saved_articles', JSON.stringify(newBookmarks));
    } catch (e) {
      console.error("Failed to save bookmarks:", e);
    }
  };

  const calculateReadingTime = (text: string) => {
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  const shareArticle = async (article: NewsArticle) => {
    try {
      const shareUrl = article.link || 'https://rawsportslive.vercel.app/news';
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead the full report at: ${shareUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openOriginalLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === "All" || 
      (activeCategory === "Saved" ? bookmarkedIds.includes(a.id) : a.category === activeCategory);
    const matchesSearch = searchQuery === "" || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderArticleItem = ({ item }: { item: NewsArticle }) => {
    const isBookmarked = bookmarkedIds.includes(item.id);
    const readTime = calculateReadingTime(item.content || item.excerpt);

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => setSelectedArticle(item)}
      >
        <View style={styles.cardImageContainer}>
          <Image 
            source={{ uri: item.image || 'https://rawsportslive.vercel.app/logo.png' }} 
            style={styles.cardImage} 
          />
          <View style={styles.categoryBadgeContainer}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardExcerpt} numberOfLines={2}>{item.excerpt}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.authorContainer}>
              <User size={12} color="#E50914" />
              <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
            </View>

            <View style={styles.footerActions}>
              <View style={styles.metaStat}>
                <Clock size={10} color="#555" />
                <Text style={styles.metaStatText}>{readTime} min</Text>
              </View>
              <View style={styles.metaStat}>
                <Eye size={10} color="#555" />
                <Text style={styles.metaStatText}>{item.views || 0}</Text>
              </View>
              <TouchableOpacity onPress={() => shareArticle(item)} style={styles.actionBtn}>
                <Share2 size={13} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.actionBtn}>
                <Bookmark size={13} color={isBookmarked ? "#E50914" : "#555"} fill={isBookmarked ? "#E50914" : "transparent"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          LATEST <Text style={{ color: '#E50914' }}>NEWS</Text>
        </Text>
        <Text style={styles.headerSub}>STAY UPDATED WITH BREAKING SPORTS INTEL</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search color="#555" size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news, rumors..."
            placeholderTextColor="#444"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#555" size={16} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {newsCategories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.categoryTab, isSelected && styles.selectedCategoryTab]}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryTabText, isSelected && styles.selectedCategoryTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Newspaper size={48} color="#222" />
          <Text style={styles.emptyTitle}>NO STORIES FOUND</Text>
          <Text style={styles.emptyText}>Check back later for fresh updates or try another category.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* News Modal Details */}
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        {selectedArticle && (
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalImageWrapper}>
                <Image source={{ uri: selectedArticle.image }} style={styles.modalImage} />
                <View style={styles.modalOverlay} />
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedArticle(null)}
                >
                  <X color="#fff" size={24} />
                </TouchableOpacity>

                <View style={styles.modalHeaderInfo}>
                  <Text style={styles.modalCategoryText}>{selectedArticle.category}</Text>
                  <Text style={styles.modalTitleText}>{selectedArticle.title}</Text>
                </View>
              </View>

              <View style={styles.modalBody}>
                {/* Meta details */}
                <View style={styles.modalMetaRow}>
                  <View style={styles.metaItem}>
                    <User size={14} color="#E50914" />
                    <Text style={styles.metaItemText}>{selectedArticle.author.toUpperCase()}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#E50914" />
                    <Text style={styles.metaItemText}>{formatDate(selectedArticle.createdAt)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#E50914" />
                    <Text style={styles.metaItemText}>
                      {calculateReadingTime(selectedArticle.content || selectedArticle.excerpt)} MIN READ
                    </Text>
                  </View>
                </View>

                {/* Main Content paragraphs */}
                <View style={styles.contentParagraphs}>
                  {(selectedArticle.content || selectedArticle.excerpt).split('\n').map((para, i) => {
                    const cleanPara = para.trim();
                    if (!cleanPara) return null;
                    return (
                      <Text key={i} style={styles.paragraphText}>
                        {cleanPara}
                      </Text>
                    );
                  })}
                </View>

                {selectedArticle.link && (
                  <TouchableOpacity 
                    style={styles.originalLinkBtn}
                    onPress={() => openOriginalLink(selectedArticle.link!)}
                  >
                    <Text style={styles.originalLinkBtnText}>READ FULL STORY ON SOURCE</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 8,
    paddingBottom: 14,
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
  headerSub: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 1,
  },

  // Search & filters
  filterSection: { paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesContainer: { paddingLeft: 16, marginBottom: 4 },
  categoriesContent: { paddingRight: 32, gap: 8 },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  selectedCategoryTab: {
    backgroundColor: BRAND_RED,
    borderColor: BRAND_RED,
  },
  categoryTabText: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedCategoryTabText: {
    color: '#fff',
    fontWeight: '900',
  },

  // List Cards
  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardImageContainer: {
    width: '100%',
    height: width * 0.52,
    backgroundColor: '#f0ece4',
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  categoryBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: BRAND_RED,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardBody: { padding: 16 },
  cardTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardExcerpt: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
  },
  authorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 10 },
  authorText: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaStatText: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '700' },
  actionBtn: { padding: 4 },

  // Loading & empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '900', marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  emptyText: { color: TEXT_SECONDARY, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Modal Detail
  modalContainer: { flex: 1, backgroundColor: BG },
  modalScroll: { flex: 1 },
  modalImageWrapper: {
    width: '100%',
    height: width * 0.75,
    position: 'relative',
    backgroundColor: '#f0ece4',
  },
  modalImage: { width: '100%', height: '100%' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24) + 8,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modalHeaderInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  modalCategoryText: {
    backgroundColor: BRAND_RED,
    color: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalTitleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
  },
  modalBody: { padding: 20 },
  modalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 16,
    marginBottom: 20,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItemText: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '900' },
  contentParagraphs: { gap: 14 },
  paragraphText: { color: TEXT_PRIMARY, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  originalLinkBtn: {
    backgroundColor: BRAND_RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  originalLinkBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
