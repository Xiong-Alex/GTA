import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);

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
  ];

  const infoItems = [
    { id: 'mode', label: 'Prototype Mode', value: 'Local Demo' },
    { id: 'version', label: 'Release', value: '1.0.0' },
    { id: 'build', label: 'Build', value: '2026.04.21' },
  ];

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
        <LinearGradient
          colors={['#000063', '#000A75', '#163E9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCard}
        >
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
        </LinearGradient>

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
          <View style={styles.toggleItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Push Notifications</Text>
              <Text style={styles.menuSubtitle}>Trip updates and Notices</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleTrack, pushNotificationsEnabled && styles.toggleTrackActive]}
              onPress={() => setPushNotificationsEnabled((current) => !current)}
              activeOpacity={0.9}
            >
              <View style={[styles.toggleThumb, pushNotificationsEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
          <View style={styles.toggleItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="mail-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Email Updates</Text>
              <Text style={styles.menuSubtitle}>newsletters</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleTrack, emailUpdatesEnabled && styles.toggleTrackActive]}
              onPress={() => setEmailUpdatesEnabled((current) => !current)}
              activeOpacity={0.9}
            >
              <View style={[styles.toggleThumb, emailUpdatesEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
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
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  toggleItem: {
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
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
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
