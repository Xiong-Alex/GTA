import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  warning: '#F59E0B',
  error: '#EF4444',
};

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  'https://travel-hub-228.preview.emergentagent.com';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  purpose: string;
  status: string;
  budget: number;
  expenses: number;
  traveler_name: string;
  traveler_email: string;
  flights: Array<{
    airline: string;
    flight: string;
    departure: string;
    arrival: string;
    from: string;
    to: string;
  }>;
  hotels: Array<{
    name: string;
    checkin: string;
    checkout: string;
    address: string;
  }>;
  meetings: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
  }>;
  notes: string;
}

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trips/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.secondary;
      case 'pending': return COLORS.warning;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.gray;
      default: return COLORS.gray;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray} />
          <Text style={styles.errorText}>Trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status & Title */}
        <View style={styles.titleSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={styles.tripMeta}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.destination}>{trip.destination}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Travel Dates</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Departure</Text>
              <Text style={styles.dateValue}>{formatDate(trip.start_date)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={COLORS.lightGray} />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Return</Text>
              <Text style={styles.dateValue}>{formatDate(trip.end_date)}</Text>
            </View>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={20} color={COLORS.secondary} />
            <Text style={styles.cardTitle}>Budget & Expenses</Text>
          </View>
          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetValue}>${trip.budget.toLocaleString()}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Spent</Text>
              <Text style={[styles.budgetValue, trip.expenses > trip.budget && styles.overBudget]}>
                ${trip.expenses.toLocaleString()}
              </Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Remaining</Text>
              <Text style={styles.budgetValue}>${(trip.budget - trip.expenses).toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((trip.expenses / trip.budget) * 100, 100)}%`,
                  backgroundColor: trip.expenses > trip.budget ? COLORS.error : COLORS.secondary,
                },
              ]}
            />
          </View>
        </View>

        {/* Flights */}
        {trip.flights.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="airplane" size={20} color={COLORS.accent} />
              <Text style={styles.cardTitle}>Flights</Text>
            </View>
            {trip.flights.map((flight, index) => (
              <View key={index} style={styles.flightItem}>
                <View style={styles.flightHeader}>
                  <Text style={styles.flightAirline}>{flight.airline}</Text>
                  <Text style={styles.flightNumber}>{flight.flight}</Text>
                </View>
                <View style={styles.flightRoute}>
                  <View style={styles.flightPoint}>
                    <Text style={styles.airportCode}>{flight.from}</Text>
                    <Text style={styles.flightTime}>{formatTime(flight.departure)}</Text>
                  </View>
                  <View style={styles.flightLine}>
                    <View style={styles.line} />
                    <Ionicons name="airplane" size={16} color={COLORS.primary} />
                    <View style={styles.line} />
                  </View>
                  <View style={styles.flightPoint}>
                    <Text style={styles.airportCode}>{flight.to}</Text>
                    <Text style={styles.flightTime}>{formatTime(flight.arrival)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Hotels */}
        {trip.hotels.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bed" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Accommodation</Text>
            </View>
            {trip.hotels.map((hotel, index) => (
              <View key={index} style={styles.hotelItem}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <Text style={styles.hotelAddress}>{hotel.address}</Text>
                <View style={styles.hotelDates}>
                  <Text style={styles.hotelDate}>Check-in: {formatDate(hotel.checkin)}</Text>
                  <Text style={styles.hotelDate}>Check-out: {formatDate(hotel.checkout)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Meetings */}
        {trip.meetings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={20} color={COLORS.secondary} />
              <Text style={styles.cardTitle}>Meetings</Text>
            </View>
            {trip.meetings.map((meeting, index) => (
              <View key={index} style={styles.meetingItem}>
                <Text style={styles.meetingTitle}>{meeting.title}</Text>
                <View style={styles.meetingMeta}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.meetingText}>{formatDate(meeting.date)} at {meeting.time}</Text>
                </View>
                <View style={styles.meetingMeta}>
                  <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.meetingText}>{meeting.location}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Traveler Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color={COLORS.gray} />
            <Text style={styles.cardTitle}>Traveler</Text>
          </View>
          <Text style={styles.travelerName}>{trip.traveler_name}</Text>
          <Text style={styles.travelerEmail}>{trip.traveler_email}</Text>
        </View>

        {/* Purpose */}
        {trip.purpose && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.gray} />
              <Text style={styles.cardTitle}>Purpose</Text>
            </View>
            <Text style={styles.purposeText}>{trip.purpose}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
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
  titleSection: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destination: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetItem: {},
  budgetLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 2,
  },
  overBudget: {
    color: COLORS.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  flightItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flightAirline: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  flightNumber: {
    fontSize: 14,
    color: COLORS.gray,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flightPoint: {
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  flightTime: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  flightLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  hotelItem: {
    paddingVertical: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  hotelAddress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  hotelDates: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  hotelDate: {
    fontSize: 13,
    color: COLORS.gray,
  },
  meetingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  meetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meetingText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 6,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  travelerEmail: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  purposeText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
