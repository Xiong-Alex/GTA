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
  status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  action_required: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch trips
      const tripsRes = await fetch(`${API_URL}/api/trips`);
      if (tripsRes.ok) {
        const trips = await tripsRes.json();
        setUpcomingTrips(trips.slice(0, 3));
      }
      
      // Fetch unread notifications count
      const notifRes = await fetch(`${API_URL}/api/notifications/unread-count`);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const seedData = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/api/seed`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error seeding data:', err);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Global Travel</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.dark} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/trips/new')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>New Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/support/chat')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Ionicons name="chatbubble-ellipses" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>AI Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/support/faq')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.accent + '15' }]}>
                <Ionicons name="help-circle" size={28} color={COLORS.accent} />
              </View>
              <Text style={styles.actionText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/profile/feedback')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                <Ionicons name="document-text" size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity onPress={() => router.push('/trips')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No upcoming trips</Text>
              <TouchableOpacity style={styles.seedBtn} onPress={seedData}>
                <Text style={styles.seedBtnText}>Load Demo Data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => router.push(`/trips/${trip.id}`)}
              >
                <View style={styles.tripInfo}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <View style={styles.tripMeta}>
                    <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                    <Text style={styles.tripDestination}>{trip.destination}</Text>
                  </View>
                  <View style={styles.tripMeta}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                    <Text style={styles.tripDate}>
                      {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpContent}>
            <Ionicons name="headset" size={32} color={COLORS.primary} />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpSubtitle}>Chat with our AI assistant 24/7</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => router.push('/support/chat')}
          >
            <Text style={styles.helpBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.gray,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  seedBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  seedBtnText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tripDestination: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  tripDate: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpText: {
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  helpSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  helpBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  helpBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
