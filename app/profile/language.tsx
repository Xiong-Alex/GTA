import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#0033A0',
  secondary: '#00A86B',
  background: '#F0F4F8',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  white: '#FFFFFF',
};

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', badge: 'EN' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', badge: 'ES' },
  { code: 'fr', name: 'French', nativeName: 'Francais', badge: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', badge: 'DE' },
  { code: 'ja', name: 'Japanese', nativeName: 'Nihongo', badge: 'JA' },
  { code: 'zh', name: 'Chinese', nativeName: 'Zhongwen', badge: 'ZH' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', badge: 'PT' },
  { code: 'ar', name: 'Arabic', nativeName: 'Arabic', badge: 'AR' },
  { code: 'ko', name: 'Korean', nativeName: 'Hanguk-eo', badge: 'KO' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', badge: 'IT' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    const lang = LANGUAGES.find((item) => item.code === code);
    Alert.alert(
      'Language Changed',
      `App language set to ${lang?.name}. This remains a prototype-level setting for now.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Control the traveler-facing language shown across this demo experience.</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Language</Text>
          <View style={styles.currentLanguage}>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>{LANGUAGES.find((item) => item.code === selectedLanguage)?.badge}</Text>
            </View>
            <View style={styles.currentInfo}>
              <Text style={styles.currentName}>{LANGUAGES.find((item) => item.code === selectedLanguage)?.name}</Text>
              <Text style={styles.currentNative}>{LANGUAGES.find((item) => item.code === selectedLanguage)?.nativeName}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[styles.languageItem, selectedLanguage === language.code && styles.languageItemSelected]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageBadge}>
                <Text style={styles.languageBadgeText}>{language.badge}</Text>
              </View>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNative}>{language.nativeName}</Text>
              </View>
              {selectedLanguage === language.code && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={22} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Prototype Note</Text>
            <Text style={styles.infoText}>
              This demo simulates language selection only. In a production system, this would control localized content, emails, notifications, and traveler guidance.
            </Text>
          </View>
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
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  placeholder: { width: 44 },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#00184B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 26 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '15',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary + '35',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  currentBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentBadgeText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  currentInfo: { flex: 1, marginLeft: 12 },
  currentName: { fontSize: 18, fontWeight: '700', color: COLORS.dark },
  currentNative: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
  },
  languageItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  languageBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBadgeText: { color: COLORS.primary, fontWeight: '700' },
  languageInfo: { flex: 1, marginLeft: 12 },
  languageName: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  languageNative: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  infoCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,51,160,0.06)' },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  infoText: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
});
