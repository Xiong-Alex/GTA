import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTrips, Trip } from '../../lib/local-data';
import { buildAllCalendarEvents } from '../../lib/calendar-data';
import { TravelCalendar } from '../../components/travel-calendar';
import { TabScreenBackground } from '../../components/tab-screen-background';

const COLORS = {
  primary: '#0033A0',
  darkBlue: '#000063',
  lightBlue: '#328DFF',
  black: '#000000',
  gray: '#666666',
  white: '#FFFFFF',
  background: '#F0F4F8',
};

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips for calendar:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const events = buildAllCalendarEvents(trips);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreenBackground />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Travel Calendar</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            A single calendar view for trips, flights, hotel stays, and meetings.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTrips(); }} colors={[COLORS.primary]} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{trips.length}</Text>
            <Text style={styles.summaryLabel}>Trips</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{events.length}</Text>
            <Text style={styles.summaryLabel}>Calendar Items</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{new Set(trips.map((trip) => trip.destination)).size}</Text>
            <Text style={styles.summaryLabel}>Destinations</Text>
          </View>
        </View>

        <TravelCalendar
          events={events}
          emptyTitle="No activity on this day"
          emptySubtitle="Pick another date to review trip movement, hotel stays, and meetings."
        />

        <View style={styles.helperCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.helperText}>Trip calendars include trip span days plus flights, hotel check-ins, hotel check-outs, and meetings.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 18,
  },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
  summaryCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBlock: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  summaryLabel: { fontSize: 12, color: COLORS.lightBlue, marginTop: 4 },
  helperCard: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
  },
});
