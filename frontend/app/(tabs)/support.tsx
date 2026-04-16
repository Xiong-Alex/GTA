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
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#FF6B35',
  background: '#F5F7FA',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  white: '#FFFFFF',
};

export default function SupportScreen() {
  const router = useRouter();

  const supportOptions = [
    {
      id: 'chat',
      icon: 'chatbubble-ellipses',
      title: 'AI Travel Assistant',
      subtitle: 'Get instant help with your travel queries',
      color: COLORS.primary,
      route: '/support/chat',
    },
    {
      id: 'faq',
      icon: 'help-circle',
      title: 'FAQ',
      subtitle: 'Browse frequently asked questions',
      color: COLORS.secondary,
      route: '/support/faq',
    },
    {
      id: 'feedback',
      icon: 'document-text',
      title: 'Submit Feedback',
      subtitle: 'Share complaints, suggestions, or praise',
      color: COLORS.accent,
      route: '/profile/feedback',
    },
  ];

  const quickContacts = [
    {
      id: 'emergency',
      icon: 'warning',
      title: 'Emergency Hotline',
      value: '1-800-TRAVEL-HELP',
      color: '#EF4444',
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Email Support',
      value: 'support@globaltravel.com',
      color: COLORS.primary,
    },
    {
      id: 'hours',
      icon: 'time',
      title: 'Support Hours',
      value: '24/7 Available',
      color: COLORS.secondary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Support</Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => router.push(option.route as any)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                <Ionicons name={option.icon as any} size={28} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contacts</Text>
          {quickContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: contact.color + '15' }]}>
                <Ionicons name={contact.icon as any} size={20} color={contact.color} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{contact.title}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI Assistant Promo */}
        <View style={styles.promoCard}>
          <View style={styles.promoIcon}>
            <Ionicons name="sparkles" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.promoTitle}>AI-Powered Support</Text>
          <Text style={styles.promoText}>
            Our AI travel assistant can help you with booking queries, expense policies,
            flight changes, and more. Available 24/7!
          </Text>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => router.push('/support/chat')}
          >
            <Text style={styles.promoBtnText}>Start Conversation</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  promoCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  promoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  promoBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
