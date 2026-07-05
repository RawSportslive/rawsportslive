import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import {
  User,
  Bell,
  Star,
  Shield,
  LogOut,
  ChevronRight,
  Settings,
  Heart,
  Mail,
  Edit3,
  Trophy,
  Radio,
  Newspaper,
  X,
} from 'lucide-react-native';
import { auth, db } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const BRAND_RED = '#E50914';
const BRAND_GOLD = '#FFBF00';
const BG = '#faf9f6';
const CARD_BG = '#ffffff';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT_PRIMARY = '#121212';
const TEXT_SECONDARY = '#6a6a6a';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) setUserData(snap.data());
        } catch (e) {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          displayName: displayName || email.split('@')[0],
          createdAt: serverTimestamp(),
        });
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      Alert.alert('Auth Error', err.message || 'Something went wrong.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          setUserData(null);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_RED} />
      </View>
    );
  }

  const menuItems = [
    { icon: Bell, label: 'Notifications', sub: 'Match alerts & breaking news', action: () => {} },
    { icon: Heart, label: 'Saved Articles', sub: 'Your bookmarked stories', action: () => {} },
    { icon: Star, label: 'Favourite Teams', sub: 'Manage your team alerts', action: () => {} },
    { icon: Trophy, label: 'Match History', sub: 'Previously watched matches', action: () => {} },
    { icon: Shield, label: 'Privacy Policy', sub: 'How we handle your data', action: () => {} },
    { icon: Mail, label: 'Contact Support', sub: 'Get help from our team', action: () => {} },
  ];

  const stats = [
    { label: 'Articles Read', value: '24', icon: Newspaper },
    { label: 'Live Watched', value: '8', icon: Radio },
    { label: 'Teams Saved', value: '3', icon: Trophy },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          MY <Text style={{ color: BRAND_RED }}>PROFILE</Text>
        </Text>
        <Text style={styles.headerSub}>RAWSPORTS LIVE ACCOUNT</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {user ? (
          <>
            {/* Avatar Card */}
            <View style={styles.avatarCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(userData?.displayName || user.email || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.avatarName}>
                  {userData?.displayName || user.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.avatarEmail}>{user.email}</Text>
                <View style={styles.memberBadge}>
                  <Star size={10} color={BRAND_GOLD} fill={BRAND_GOLD} />
                  <Text style={styles.memberBadgeText}>RAWSPORTS MEMBER</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Edit3 size={16} color={BRAND_RED} />
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {stats.map(({ label, value, icon: Icon }) => (
                <View key={label} style={styles.statBox}>
                  <Icon size={18} color={BRAND_RED} />
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Notifications Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PREFERENCES</Text>
              <View style={styles.toggleCard}>
                <View style={styles.toggleLeft}>
                  <Bell size={18} color={BRAND_RED} />
                  <View>
                    <Text style={styles.toggleTitle}>Push Notifications</Text>
                    <Text style={styles.toggleSub}>Match alerts & news updates</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#e0e0e0', true: BRAND_RED + '40' }}
                  thumbColor={notificationsEnabled ? BRAND_RED : '#999'}
                />
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ACCOUNT</Text>
              <View style={styles.menuCard}>
                {menuItems.map(({ icon: Icon, label, sub, action }, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                    onPress={action}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconBox}>
                      <Icon size={16} color={BRAND_RED} />
                    </View>
                    <View style={styles.menuTextBox}>
                      <Text style={styles.menuLabel}>{label}</Text>
                      <Text style={styles.menuSub}>{sub}</Text>
                    </View>
                    <ChevronRight size={16} color={TEXT_SECONDARY} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
              <LogOut size={16} color="#fff" />
              <Text style={styles.signOutText}>SIGN OUT</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Guest View */
          <View style={styles.guestContainer}>
            <View style={styles.guestIconCircle}>
              <User size={48} color={BRAND_RED} />
            </View>
            <Text style={styles.guestTitle}>Join RawSports Live</Text>
            <Text style={styles.guestSub}>
              Sign in to save your favourite teams, bookmark articles, and get personalised match alerts.
            </Text>

            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => { setAuthMode('login'); setShowAuthModal(true); }}
              activeOpacity={0.8}
            >
              <Text style={styles.signInBtnText}>SIGN IN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* Feature list */}
            <View style={styles.featureList}>
              {[
                { icon: Bell, text: 'Live match notifications' },
                { icon: Heart, text: 'Bookmark news articles' },
                { icon: Trophy, text: 'Follow your favourite teams' },
              ].map(({ icon: Icon, text }) => (
                <View key={text} style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <Icon size={14} color={BRAND_RED} />
                  </View>
                  <Text style={styles.featureText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Auth Modal */}
      <Modal visible={showAuthModal} animationType="slide" transparent onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                <X size={22} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            {authMode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor={TEXT_SECONDARY}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.authSubmitBtn} onPress={handleAuth} disabled={authLoading} activeOpacity={0.85}>
              {authLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.authSubmitText}>
                  {authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              style={styles.switchModeBtn}
            >
              <Text style={styles.switchModeText}>
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={{ color: BRAND_RED, fontWeight: '900' }}>
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

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

  scrollContent: { paddingBottom: 40 },

  // Avatar Card
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 26, fontWeight: '900' },
  avatarInfo: { flex: 1, marginLeft: 14 },
  avatarName: { color: TEXT_PRIMARY, fontSize: 17, fontWeight: '900' },
  avatarEmail: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: BRAND_GOLD + '18',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND_GOLD + '40',
  },
  memberBadgeText: { color: BRAND_GOLD, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  editBtn: { padding: 8 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    gap: 4,
  },
  statValue: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: '900' },
  statLabel: { color: TEXT_SECONDARY, fontSize: 9, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },

  // Section
  section: { marginTop: 8, paddingHorizontal: 16 },
  sectionLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Toggle
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 4,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '700' },
  toggleSub: { color: TEXT_SECONDARY, fontSize: 11, marginTop: 1 },

  // Menu
  menuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND_RED + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextBox: { flex: 1 },
  menuLabel: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '700' },
  menuSub: { color: TEXT_SECONDARY, fontSize: 11, marginTop: 1 },

  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_RED,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  signOutText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // Guest
  guestContainer: { alignItems: 'center', padding: 24, paddingTop: 40 },
  guestIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND_RED + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: BRAND_RED + '20',
  },
  guestTitle: { color: TEXT_PRIMARY, fontSize: 22, fontWeight: '900', marginBottom: 10 },
  guestSub: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: '85%',
  },
  signInBtn: {
    backgroundColor: BRAND_RED,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
  signUpBtn: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BRAND_RED,
    marginBottom: 32,
  },
  signUpBtnText: { color: BRAND_RED, fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
  featureList: { width: '100%', gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BRAND_RED + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { color: TEXT_PRIMARY, fontSize: 13, fontWeight: '600' },

  // Auth Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: TEXT_PRIMARY, fontSize: 20, fontWeight: '900' },
  input: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TEXT_PRIMARY,
    fontSize: 14,
    marginBottom: 12,
  },
  authSubmitBtn: {
    backgroundColor: BRAND_RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  authSubmitText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  switchModeBtn: { alignItems: 'center', marginTop: 16 },
  switchModeText: { color: TEXT_SECONDARY, fontSize: 13 },
});
