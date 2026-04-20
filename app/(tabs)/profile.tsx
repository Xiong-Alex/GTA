import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getTrips, getUnreadNotificationCount } from '../../lib/local-data';
import { TabScreenBackground } from '../../components/tab-screen-background';

const COLORS = {
  primary: '#0033A0',
  darkBlue: '#000063',
  mediumBlue: '#2D67FF',
  lightBlue: '#328DFF',
  black: '#000000',
  gray: '#666666',
  white: '#FFFFFF',
  background: '#F0F4F8',
  lightGray: '#E5E7EB',
  success: '#00A86B',
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ trips: 0, destinations: 0, budget: 0, alerts: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const trips = await getTrips();
        const alerts = await getUnreadNotificationCount();
        setStats({
          trips: trips.length,
          destinations: new Set(trips.map((trip) => trip.destination)).size,
          budget: trips.reduce((sum, trip) => sum + trip.budget, 0),
          alerts,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const menuItems = [
    {
      id: 'language',
      icon: 'language',
      title: 'Language and Localization',
      subtitle: 'Switch the interface language for traveler-facing screens.',
      route: '/profile/language',
    },
    {
      id: 'feedback',
      icon: 'document-text',
      title: 'Feedback Intake',
      subtitle: 'Log complaints, suggestions, and service quality observations.',
      route: '/profile/feedback',
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Review unread approvals, changes, and action items.',
      route: '/notifications',
    },
  ];

  const infoItems = [
    { id: 'mode', label: 'Prototype Mode', value: 'Local Demo' },
    { id: 'version', label: 'Release', value: '1.0.0' },
    { id: 'build', label: 'Build', value: '2026.04.17' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreenBackground />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Traveler profile, settings, and account preferences
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={COLORS.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Business Traveler</Text>
            <Text style={styles.userEmail}>user@company.com</Text>
            <Text style={styles.userMeta}>Traveler profile and settings workspace</Text>
          </View>
          <View style={styles.companyBadge}>
            <Text style={styles.companyText}>CORP</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.trips}</Text>
              <Text style={styles.statLabel}>Cases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.destinations}</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.alerts}</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>
          <View style={styles.budgetStrip}>
            <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
            <Text style={styles.budgetStripText}>Tracked demo budget: ${stats.budget.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traveler Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Info</Text>
          <View style={styles.infoCard}>
            {infoItems.map((item, index) => (
              <View key={item.id} style={[styles.infoRow, index < infoItems.length - 1 && styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons name="briefcase" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.footerText}>Global Travel Prototype</Text>
          <Text style={styles.footerSubtext}>Corporate travel management demo experience</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 18,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.mediumBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  userEmail: { fontSize: 14, color: COLORS.lightBlue, marginTop: 2 },
  userMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  companyBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  companyText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.lightGray },
  statValue: { fontSize: 26, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  budgetStrip: {
    marginTop: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetStripText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  menuSubtitle: { fontSize: 12, color: COLORS.gray, marginTop: 4, lineHeight: 18 },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,51,160,0.06)' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  infoLabel: { fontSize: 14, color: COLORS.gray },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  footerSubtext: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
});
