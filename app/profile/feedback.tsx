import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { submitFeedback } from '../../lib/local-data';

const COLORS = {
  primary: '#0033A0',
  secondary: '#00A86B',
  accent: '#FF6B35',
  background: '#F0F4F8',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  white: '#FFFFFF',
  warning: '#F59E0B',
  error: '#EF4444',
};

const FEEDBACK_TYPES = [
  { id: 'complaint', label: 'Complaint', icon: 'sad-outline', color: COLORS.error },
  { id: 'suggestion', label: 'Suggestion', icon: 'bulb-outline', color: COLORS.warning },
  { id: 'praise', label: 'Praise', icon: 'happy-outline', color: COLORS.secondary },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a feedback type');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        type: selectedType,
        subject: subject.trim(),
        message: message.trim(),
        user_email: email.trim(),
      });

      Alert.alert('Thank You', 'Your feedback has been saved successfully on this device.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Alert.alert('Error', 'Unable to save feedback locally. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Feedback Intake</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Capture service feedback, escalation notes, or product suggestions from travelers.</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeGrid}>
              {FEEDBACK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && { borderColor: type.color, backgroundColor: type.color + '10' },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                    <Ionicons name={type.icon as any} size={26} color={type.color} />
                  </View>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  {selectedType === type.id && (
                    <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                      <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief summary of the issue or idea"
              placeholderTextColor={COLORS.gray}
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Details *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe the context, what happened, and any follow-up that may be needed..."
              placeholderTextColor={COLORS.gray}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{message.length}/1000</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Contact Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@company.com"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>Used only for demo follow-up context inside this prototype.</Text>
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
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
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 26 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  section: { marginBottom: 24, backgroundColor: COLORS.white, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(0,51,160,0.06)' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },
  typeGrid: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  typeIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputMultiline: { minHeight: 150 },
  charCount: { fontSize: 12, color: COLORS.gray, textAlign: 'right', marginTop: 4 },
  helperText: { fontSize: 12, color: COLORS.gray, marginTop: 6, lineHeight: 18 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
    gap: 8,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
