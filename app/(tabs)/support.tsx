import React from 'react';
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
  warning: '#F59E0B',
  error: '#EF4444',
};

export default function SupportScreen() {
  const router = useRouter();

  const supportOptions = [
    {
      id: 'chat',
      icon: 'chatbubble-ellipses',
      title: 'Operations Assistant',
      subtitle: 'Get guidance on bookings, policy, reimbursements, and travel changes.',
      color: COLORS.primary,
      route: '/support/chat',
    },
    {
      id: 'faq',
      icon: 'help-circle',
      title: 'Knowledge Base',
      subtitle: 'Browse answers to common corporate travel and expense questions.',
      color: COLORS.mediumBlue,
      route: '/support/faq',
    },
    {
      id: 'feedback',
      icon: 'document-text',
      title: 'Feedback Intake',
      subtitle: 'Log a complaint, suggestion, or experience note for the travel team.',
      color: COLORS.lightBlue,
      route: '/profile/feedback',
    },
  ];

  const quickContacts = [
    { id: 'emergency', icon: 'warning', title: 'Emergency Line', value: '1-800-TRAVEL-HELP', color: COLORS.error },
    { id: 'email', icon: 'mail', title: 'Shared Inbox', value: 'support@globaltravel.com', color: COLORS.primary },
    { id: 'hours', icon: 'time', title: 'Response Window', value: '24/7 Demo Coverage', color: COLORS.success },
  ];

  const serviceAreas = [
    'Flight and hotel adjustments',
    'Out-of-policy expense guidance',
    'Ground transport exceptions',
    'Traveler issue escalation',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Support Center</Text>
          <Text style={styles.subtitle}>Designed for employee travel operations, issue triage, and fast assistance.</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Support coverage</Text>
          <Text style={styles.heroTitle}>Choose the right channel for policy help, service issues, or travel changes.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Channels</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => router.push(option.route as any)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contacts</Text>
          <View style={styles.contactGrid}>
            {quickContacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: contact.color + '15' }]}>
                  <Ionicons name={contact.icon as any} size={20} color={contact.color} />
                </View>
                <Text style={styles.contactTitle}>{contact.title}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="layers-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Typical Support Areas</Text>
          </View>
          {serviceAreas.map((area) => (
            <View key={area} style={styles.infoRow}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>{area}</Text>
            </View>
          ))}
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoIcon}>
            <Ionicons name="sparkles" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.promoTitle}>Demo Assistant</Text>
          <Text style={styles.promoText}>
            The current prototype uses a local assistant so stakeholders can interact with the support flow without a backend.
          </Text>
          <TouchableOpacity style={styles.promoBtn} onPress={() => router.push('/support/chat')}>
            <Text style={styles.promoBtnText}>Start Conversation</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  heroCard: {
    marginBottom: 24,
    backgroundColor: COLORS.darkBlue,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  heroEyebrow: { color: COLORS.lightBlue, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  heroTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700', lineHeight: 28, marginTop: 8 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: { flex: 1, marginLeft: 14, paddingRight: 8 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  optionSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4, lineHeight: 19 },
  contactGrid: { gap: 10 },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactTitle: { fontSize: 12, color: COLORS.gray, textTransform: 'uppercase' },
  contactValue: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginTop: 4 },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,51,160,0.06)' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  infoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 7, marginRight: 10 },
  infoText: { flex: 1, fontSize: 14, color: COLORS.gray, lineHeight: 20 },
  promoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  promoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  promoText: { fontSize: 14, color: COLORS.lightBlue, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  promoBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});
