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
import { createTrip } from '../../lib/local-data';

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
  error: '#EF4444',
};

const DESTINATIONS = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Singapore', 'San Francisco'
];

export default function NewTripScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    purpose: '',
    budget: '',
    traveler_name: '',
    traveler_email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.start_date.trim()) newErrors.start_date = 'Start date is required';
    if (!formData.end_date.trim()) newErrors.end_date = 'End date is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!formData.traveler_name.trim()) newErrors.traveler_name = 'Traveler name is required';
    if (!formData.traveler_email.trim()) newErrors.traveler_email = 'Email is required';
    if (formData.traveler_email && !formData.traveler_email.includes('@')) {
      newErrors.traveler_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createTrip({
        ...formData,
        budget: parseFloat(formData.budget) || 0,
      });
      Alert.alert('Success', 'Trip request saved locally!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Error creating trip:', err);
      Alert.alert('Error', 'Unable to save trip locally. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectDestination = (dest: string) => {
    setFormData({ ...formData, destination: dest });
    setShowDestinations(false);
    setErrors({ ...errors, destination: '' });
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric';
      autoCapitalize?: 'none' | 'sentences' | 'words';
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.inputMultiline,
          errors[field] && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        value={formData[field]}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          if (errors[field]) setErrors({ ...errors, [field]: '' });
        }}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Trip Request</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trip Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="airplane" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Trip Details</Text>
            </View>
            
            {renderInput('Trip Title', 'title', 'e.g., Q3 Sales Meeting')}
            
            {/* Destination Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.pickerInput,
                  errors.destination && styles.inputError,
                ]}
                onPress={() => setShowDestinations(!showDestinations)}
              >
                <Text style={formData.destination ? styles.pickerText : styles.pickerPlaceholder}>
                  {formData.destination || 'Select destination'}
                </Text>
                <Ionicons
                  name={showDestinations ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
              {showDestinations && (
                <View style={styles.dropdown}>
                  {DESTINATIONS.map((dest) => (
                    <TouchableOpacity
                      key={dest}
                      style={styles.dropdownItem}
                      onPress={() => selectDestination(dest)}
                    >
                      <View style={styles.dropdownIcon}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                      </View>
                      <Text style={styles.dropdownText}>{dest}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.destination && <Text style={styles.errorText}>{errors.destination}</Text>}
            </View>

            {renderInput('Start Date', 'start_date', 'YYYY-MM-DD')}
            {renderInput('End Date', 'end_date', 'YYYY-MM-DD')}
            {renderInput('Purpose', 'purpose', 'Describe the purpose of this trip', { multiline: true })}
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
                <Ionicons name="wallet" size={18} color={COLORS.mediumBlue} />
              </View>
              <Text style={styles.sectionTitle}>Budget</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Budget (USD)</Text>
              <View style={styles.budgetInput}>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencySymbol}>$</Text>
                </View>
                <TextInput
                  style={styles.budgetField}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray}
                  value={formData.budget}
                  onChangeText={(text) => setFormData({ ...formData, budget: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Traveler Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.lightBlue + '15' }]}>
                <Ionicons name="person" size={18} color={COLORS.lightBlue} />
              </View>
              <Text style={styles.sectionTitle}>Traveler Information</Text>
            </View>
            {renderInput('Full Name', 'traveler_name', 'John Smith', { autoCapitalize: 'words' })}
            {renderInput('Email', 'traveler_email', 'john.smith@company.com', {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.gray + '15' }]}>
                <Ionicons name="document-text" size={18} color={COLORS.gray} />
              </View>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
            </View>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Any special requirements or notes..."
              placeholderTextColor={COLORS.gray}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 20,
    shadowColor: COLORS.darkBlue,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
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
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.black,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: COLORS.gray,
  },
  dropdown: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  currencyBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  budgetField: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    padding: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
