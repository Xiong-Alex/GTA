import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getTrips } from '../../lib/local-data';
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
  cardTint: '#F7FAFD',
  lightGray: '#E5E7EB',
  success: '#00A86B',
  warning: '#F59E0B',
  error: '#EF4444',
  slate: '#32415D',
};

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  expenses: number;
  flights?: unknown[];
  hotels?: unknown[];
  meetings?: unknown[];
}

export default function TripsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const filteredTrips = trips.filter((trip) => (filter === 'all' ? true : trip.status === filter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'in_progress':
        return COLORS.mediumBlue;
      case 'completed':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'in_progress', label: 'Active' },
    { key: 'completed', label: 'Closed' },
  ];

  const summary = {
    total: trips.length,
    pending: trips.filter((trip) => trip.status === 'pending').length,
    active: trips.filter((trip) => trip.status === 'in_progress' || trip.status === 'approved').length,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreenBackground />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Travel Cases</Text>
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              Manage all employee travel activity
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/trips/new')}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryWrapper}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{summary.active}</Text>
            <Text style={styles.summaryLabel}>Tracked</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterChip, filter === option.key && styles.filterChipActive]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="briefcase-outline" size={56} color={COLORS.lightBlue} />
            </View>
            <Text style={styles.emptyTitle}>No travel cases found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? 'Create a new case to start tracking travel.' : `No ${filter.replace('_', ' ')} cases right now.`}
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => {
            const coverage = (trip.flights?.length || 0) + (trip.hotels?.length || 0) + (trip.meetings?.length || 0);
            return (
              <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => router.push(`/trips/${trip.id}`)}>
                <View style={styles.tripHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </View>

                <Text style={styles.tripTitle}>{trip.title}</Text>
                <View style={styles.tripDetails}>
                  <View style={styles.tripDetail}>
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                    <Text style={styles.tripDetailText}>{trip.destination}</Text>
                  </View>
                  <View style={styles.tripDetail}>
                    <Ionicons name="calendar" size={14} color={COLORS.primary} />
                    <Text style={styles.tripDetailText}>
                      {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Budget</Text>
                    <Text style={styles.metricValue}>${trip.budget.toLocaleString()}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Spent</Text>
                    <Text style={[styles.metricValue, trip.expenses > trip.budget && styles.overBudget]}>
                      ${trip.expenses.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Coverage</Text>
                    <Text style={styles.metricValue}>{coverage}</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${trip.budget > 0 ? Math.min((trip.expenses / trip.budget) * 100, 100) : 0}%`,
                          backgroundColor: trip.expenses > trip.budget ? COLORS.error : COLORS.success,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  summaryBlock: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.14)' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  summaryLabel: { fontSize: 12, color: COLORS.lightBlue, marginTop: 4 },
  filterScroll: { maxHeight: 64, backgroundColor: COLORS.background },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  filterText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  filterTextActive: { color: COLORS.white },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.gray, marginTop: 8, textAlign: 'center' },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  tripTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginTop: 12 },
  tripDetails: { marginTop: 10, gap: 6 },
  tripDetail: { flexDirection: 'row', alignItems: 'center' },
  tripDetailText: { fontSize: 13, color: COLORS.gray, marginLeft: 8 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.cardTint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  metric: { flex: 1 },
  metricLabel: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase' },
  metricValue: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginTop: 4 },
  overBudget: { color: COLORS.error },
  progressContainer: { marginTop: 14 },
  progressBar: { height: 8, backgroundColor: COLORS.lightGray, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
