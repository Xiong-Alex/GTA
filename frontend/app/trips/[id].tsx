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
      case 'approved': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'in_progress': return COLORS.mediumBlue;
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
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.lightBlue} />
          </View>
          <Text style={styles.errorText}>Trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Status & Title */}
        <View style={styles.titleSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
            <Text style={styles.statusText}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={styles.tripMeta}>
            <Ionicons name="location" size={18} color={COLORS.lightBlue} />
            <Text style={styles.destination}>{trip.destination}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Dates */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Travel Dates</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Departure</Text>
              <Text style={styles.dateValue}>{formatDate(trip.start_date)}</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.lightGray} />
            </View>
            <View style={[styles.dateItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateLabel}>Return</Text>
              <Text style={styles.dateValue}>{formatDate(trip.end_date)}</Text>
            </View>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="wallet" size={20} color={COLORS.success} />
            </View>
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
              <Text style={[styles.budgetValue, { color: COLORS.success }]}>
                ${(trip.budget - trip.expenses).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((trip.expenses / trip.budget) * 100, 100)}%`,
                  backgroundColor: trip.expenses > trip.budget ? COLORS.error : COLORS.success,
                },
              ]}
            />
          </View>
        </View>

        {/* Flights */}
        {trip.flights.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
                <Ionicons name="airplane" size={20} color={COLORS.mediumBlue} />
              </View>
              <Text style={styles.cardTitle}>Flights</Text>
            </View>
            {trip.flights.map((flight, index) => (
              <View key={index} style={[styles.flightItem, index > 0 && styles.flightItemBorder]}>
                <View style={styles.flightHeader}>
                  <Text style={styles.flightAirline}>{flight.airline}</Text>
                  <View style={styles.flightNumberBadge}>
                    <Text style={styles.flightNumber}>{flight.flight}</Text>
                  </View>
                </View>
                <View style={styles.flightRoute}>
                  <View style={styles.flightPoint}>
                    <Text style={styles.airportCode}>{flight.from}</Text>
                    <Text style={styles.flightTime}>{formatTime(flight.departure)}</Text>
                  </View>
                  <View style={styles.flightLine}>
                    <View style={styles.line} />
                    <View style={styles.planeIcon}>
                      <Ionicons name="airplane" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.line} />
                  </View>
                  <View style={[styles.flightPoint, { alignItems: 'flex-end' }]}>
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
              <View style={[styles.cardIcon, { backgroundColor: COLORS.lightBlue + '15' }]}>
                <Ionicons name="bed" size={20} color={COLORS.lightBlue} />
              </View>
              <Text style={styles.cardTitle}>Accommodation</Text>
            </View>
            {trip.hotels.map((hotel, index) => (
              <View key={index} style={styles.hotelItem}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelMeta}>
                  <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                  <Text style={styles.hotelAddress}>{hotel.address}</Text>
                </View>
                <View style={styles.hotelDates}>
                  <View style={styles.hotelDateItem}>
                    <Text style={styles.hotelDateLabel}>Check-in</Text>
                    <Text style={styles.hotelDateValue}>{formatDate(hotel.checkin)}</Text>
                  </View>
                  <View style={styles.hotelDateItem}>
                    <Text style={styles.hotelDateLabel}>Check-out</Text>
                    <Text style={styles.hotelDateValue}>{formatDate(hotel.checkout)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Meetings */}
        {trip.meetings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.darkBlue + '15' }]}>
                <Ionicons name="people" size={20} color={COLORS.darkBlue} />
              </View>
              <Text style={styles.cardTitle}>Meetings</Text>
            </View>
            {trip.meetings.map((meeting, index) => (
              <View key={index} style={[styles.meetingItem, index > 0 && styles.meetingItemBorder]}>
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
            <View style={[styles.cardIcon, { backgroundColor: COLORS.gray + '15' }]}>
              <Ionicons name="person" size={20} color={COLORS.gray} />
            </View>
            <Text style={styles.cardTitle}>Traveler</Text>
          </View>
          <View style={styles.travelerInfo}>
            <View style={styles.travelerAvatar}>
              <Ionicons name="person" size={24} color={COLORS.white} />
            </View>
            <View style={styles.travelerDetails}>
              <Text style={styles.travelerName}>{trip.traveler_name}</Text>
              <Text style={styles.travelerEmail}>{trip.traveler_email}</Text>
            </View>
          </View>
        </View>

        {/* Purpose */}
        {trip.purpose && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="document-text" size={20} color={COLORS.primary} />
              </View>
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
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
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
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destination: {
    fontSize: 16,
    color: COLORS.lightBlue,
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },
  dateArrow: {
    paddingHorizontal: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {},
  budgetLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
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
  },
  flightItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flightAirline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
  },
  flightNumberBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flightNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flightPoint: {
    width: 70,
  },
  airportCode: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
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
    paddingHorizontal: 8,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
  },
  planeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  hotelItem: {
    paddingVertical: 8,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
  },
  hotelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hotelAddress: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 6,
    flex: 1,
  },
  hotelDates: {
    flexDirection: 'row',
    gap: 24,
  },
  hotelDateItem: {},
  hotelDateLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  hotelDateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  meetingItem: {
    paddingVertical: 12,
  },
  meetingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
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
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelerDetails: {
    marginLeft: 12,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  travelerEmail: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  purposeText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
});
