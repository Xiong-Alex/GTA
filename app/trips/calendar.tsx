import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTrip, Trip } from '../../lib/local-data';
import { buildTripCalendarEvents } from '../../lib/calendar-data';
import { TravelCalendar } from '../../components/travel-calendar';

const COLORS = {
  primary: '#0033A0',
  darkBlue: '#000063',
  lightBlue: '#328DFF',
  white: '#FFFFFF',
  background: '#F0F4F8',
  gray: '#666666',
  black: '#000000',
};

export default function TripCalendarScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (tripId) {
          const data = await getTrip(String(tripId));
          setTrip(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

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
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Trip calendar unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const events = buildTripCalendarEvents(trip);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Calendar</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Trip Timeline</Text>
          <Text style={styles.heroTitle}>{trip.title}</Text>
          <Text style={styles.heroSubtitle}>
            {trip.destination} | {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <TravelCalendar
          events={events}
          emptyTitle="No trip activity on this day"
          emptySubtitle="Pick another day to review flights, hotel dates, meetings, and trip span activity."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15, color: COLORS.gray },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 18,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.lightBlue,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    lineHeight: 20,
  },
});
