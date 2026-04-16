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
import Constants from 'expo-constants';

const COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#FF6B35',
  background: '#F5F7FA',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  white: '#FFFFFF',
  error: '#EF4444',
};

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  'https://travel-hub-228.preview.emergentagent.com';

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
      const res = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
        }),
      });

      if (res.ok) {
        Alert.alert('Success', 'Trip request submitted successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to submit trip request');
      }
    } catch (err) {
      console.error('Error creating trip:', err);
      Alert.alert('Error', 'Network error. Please try again.');
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
      <Text style={styles.label}>{label} *</Text>
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip Request</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trip Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            
            {renderInput('Trip Title', 'title', 'e.g., Q3 Sales Meeting')}
            
            {/* Destination Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination *</Text>
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
                      <Ionicons name="location" size={18} color={COLORS.primary} />
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
            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Budget (USD)</Text>
              <View style={styles.budgetInput}>
                <Text style={styles.currencySymbol}>$</Text>
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
            <Text style={styles.sectionTitle}>Traveler Information</Text>
            {renderInput('Full Name', 'traveler_name', 'John Smith', { autoCapitalize: 'words' })}
            {renderInput('Email', 'traveler_email', 'john.smith@company.com', {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.dark,
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
    color: COLORS.dark,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: COLORS.gray,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  dropdownText: {
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 10,
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginRight: 8,
  },
  budgetField: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    paddingVertical: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
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
