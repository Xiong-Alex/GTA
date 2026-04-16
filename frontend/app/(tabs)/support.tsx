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
  error: '#EF4444',
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
      color: COLORS.mediumBlue,
      route: '/support/faq',
    },
    {
      id: 'feedback',
      icon: 'document-text',
      title: 'Submit Feedback',
      subtitle: 'Share complaints, suggestions, or praise',
      color: COLORS.lightBlue,
      route: '/profile/feedback',
    },
  ];

  const quickContacts = [
    {
      id: 'emergency',
      icon: 'warning',
      title: 'Emergency Hotline',
      value: '1-800-TRAVEL-HELP',
      color: COLORS.error,
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
      color: COLORS.success,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Support</Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
            <Ionicons name="sparkles" size={32} color={COLORS.white} />
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
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
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
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightBlue,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
    color: COLORS.black,
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
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  contactIcon: {
    width: 44,
    height: 44,
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
    color: COLORS.black,
  },
  promoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
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
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: COLORS.lightBlue,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  promoBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
