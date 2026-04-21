import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

const EXPENSE_CATEGORIES = [
  { id: 'rides', label: 'Rides', icon: 'car-outline' },
  { id: 'meals', label: 'Meals', icon: 'restaurant-outline' },
  { id: 'lodging', label: 'Lodging', icon: 'bed-outline' },
  { id: 'airfare', label: 'Airfare', icon: 'airplane-outline' },
  { id: 'incidentals', label: 'Incidentals', icon: 'wallet-outline' },
];

export default function ReportExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripId?: string; tripTitle?: string }>();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('rides');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(today);
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const handleUploadReceipt = () => {
    setReceiptName('receipt-demo-upload.pdf');
    Alert.alert('Receipt Attached', 'This prototype action simulates attaching a receipt to the expense report.');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Add a short name for this expense.');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('Missing amount', 'Enter the expense amount.');
      return;
    }
    if (!receiptName) {
      Alert.alert('Receipt recommended', 'Attach a receipt before submitting this expense.');
      return;
    }

    Alert.alert(
      'Expense Saved',
      'This prototype would save the expense details and attached receipt to the trip record.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report Expense</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Expense Entry</Text>
            <Text style={styles.heroTitle}>{params.tripTitle || 'Trip expense report'}</Text>
            <Text style={styles.heroSubtitle}>Add the expense details, choose a category, and attach the receipt in one step.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Details</Text>

            <Text style={styles.label}>Expense Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Taxi from airport"
              placeholderTextColor={COLORS.gray}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryCard, category === item.id && styles.categoryCardActive]}
                  onPress={() => setCategory(item.id)}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={category === item.id ? COLORS.white : COLORS.primary}
                  />
                  <Text style={[styles.categoryText, category === item.id && styles.categoryTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="125.00"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={expenseDate}
                  onChangeText={setExpenseDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>

            <Text style={styles.label}>Merchant or Vendor</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Uber, Marriott, Delta"
              placeholderTextColor={COLORS.gray}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional details about the expense"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <Text style={styles.receiptHelper}>Attach the supporting receipt as part of this expense report.</Text>

            <TouchableOpacity style={styles.receiptCard} onPress={handleUploadReceipt}>
              <View style={styles.receiptIcon}>
                <Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.receiptContent}>
                <Text style={styles.receiptTitle}>{receiptName || 'Upload receipt'}</Text>
                <Text style={styles.receiptSubtitle}>
                  {receiptName ? 'Receipt attached to this draft expense' : 'Tap to simulate selecting a file or image'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.submitBtnText}>Save Expense Report</Text>
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 18,
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
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
  heroCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  heroEyebrow: {
    color: COLORS.lightBlue,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.black, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  receiptHelper: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
    marginBottom: 12,
  },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  receiptIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  receiptSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
