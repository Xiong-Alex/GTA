import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
};

export default function MoreScreen() {
  const router = useRouter();

  const primaryItems = [
    {
      id: 'support',
      icon: 'chatbubbles-outline',
      title: 'Support Center',
      subtitle: 'Chat, FAQ, and assistance channels',
      color: COLORS.mediumBlue,
      route: '/support',
    },
    {
      id: 'profile',
      icon: 'person-circle-outline',
      title: 'Profile',
      subtitle: 'Account settings and preferences',
      color: COLORS.primary,
      route: '/profile',
    },
  ];

  const quickLinks = [
    { id: 'chat', icon: 'chatbubble-ellipses-outline', label: 'Chat Support', route: '/support/chat' },
    { id: 'faq', icon: 'help-circle-outline', label: 'FAQ', route: '/support/faq' },
    { id: 'feedback', icon: 'document-text-outline', label: 'Feedback', route: '/profile/feedback' },
    { id: 'language', icon: 'language-outline', label: 'Language', route: '/profile/language' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreenBackground />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Extra tools, support resources, and profile settings
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {primaryItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.primaryCard}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.primaryIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={item.color} />
            </View>
            <View style={styles.primaryTextWrap}>
              <Text style={styles.primaryTitle}>{item.title}</Text>
              <Text style={styles.primarySubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ))}

        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>Quick Links</Text>
          <View style={styles.quickCard}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={link.id}
                style={[styles.quickRow, index > 0 && styles.quickRowBorder]}
                onPress={() => router.push(link.route as any)}
                activeOpacity={0.85}
              >
                <View style={styles.quickIcon}>
                  <Ionicons name={link.icon as keyof typeof Ionicons.glyphMap} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.quickLabel}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
  primaryCard: {
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
  primaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTextWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  primarySubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 19,
  },
  quickSection: {
    marginTop: 12,
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
  },
  quickCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    overflow: 'hidden',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quickRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '12',
    marginRight: 10,
  },
  quickLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
});
