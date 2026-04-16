import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
};

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  'https://travel-hub-228.preview.emergentagent.com';

const { width } = Dimensions.get('window');

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  coordinates: { lat: number; lng: number };
}

const WORLD_CITIES = [
  { name: 'New York', x: 0.28, y: 0.35, region: 'NA' },
  { name: 'London', x: 0.48, y: 0.28, region: 'EU' },
  { name: 'Paris', x: 0.49, y: 0.32, region: 'EU' },
  { name: 'Tokyo', x: 0.85, y: 0.38, region: 'AS' },
  { name: 'Sydney', x: 0.88, y: 0.75, region: 'OC' },
  { name: 'Dubai', x: 0.60, y: 0.45, region: 'ME' },
  { name: 'Singapore', x: 0.75, y: 0.55, region: 'AS' },
  { name: 'San Francisco', x: 0.15, y: 0.38, region: 'NA' },
];

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trips`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
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

  const getTripsByDestination = (destination: string) => {
    return trips.filter(t => t.destination === destination);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.secondary;
      case 'pending': return COLORS.warning;
      case 'in_progress': return COLORS.primary;
      default: return COLORS.gray;
    }
  };

  const mapWidth = width - 32;
  const mapHeight = mapWidth * 0.6;

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Travel Map</Text>
          <Text style={styles.subtitle}>Your destinations worldwide</Text>
        </View>

        {/* Mock Map */}
        <View style={styles.mapContainer}>
          <View style={[styles.mapPlaceholder, { width: mapWidth, height: mapHeight }]}>
            {/* World Map Grid */}
            <View style={styles.mapGrid}>
              {/* Continents (simplified shapes) */}
              <View style={[styles.continent, { left: '5%', top: '20%', width: '25%', height: '40%' }]}>
                <Text style={styles.continentLabel}>Americas</Text>
              </View>
              <View style={[styles.continent, { left: '40%', top: '15%', width: '20%', height: '35%' }]}>
                <Text style={styles.continentLabel}>Europe</Text>
              </View>
              <View style={[styles.continent, { left: '55%', top: '30%', width: '25%', height: '40%' }]}>
                <Text style={styles.continentLabel}>Asia</Text>
              </View>
              <View style={[styles.continent, { left: '78%', top: '55%', width: '15%', height: '25%' }]}>
                <Text style={styles.continentLabel}>Oceania</Text>
              </View>

              {/* City markers */}
              {WORLD_CITIES.map((city) => {
                const cityTrips = getTripsByDestination(city.name);
                const hasTrips = cityTrips.length > 0;
                const primaryTrip = cityTrips[0];

                return (
                  <View
                    key={city.name}
                    style={[
                      styles.marker,
                      {
                        left: `${city.x * 100}%`,
                        top: `${city.y * 100}%`,
                        backgroundColor: hasTrips
                          ? getStatusColor(primaryTrip?.status || '')
                          : COLORS.lightGray,
                      },
                    ]}
                  >
                    {hasTrips && (
                      <View style={styles.markerPulse} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Map Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>MOCK MAP</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="airplane" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>
              {new Set(trips.map(t => t.destination)).size}
            </Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>
              {trips.filter(t => t.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Destinations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinations</Text>
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="globe-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No trip destinations yet</Text>
            </View>
          ) : (
            trips.map((trip) => (
              <View key={trip.id} style={styles.destinationCard}>
                <View style={styles.destinationIcon}>
                  <Ionicons name="location" size={20} color={COLORS.white} />
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{trip.destination}</Text>
                  <Text style={styles.destinationTrip}>{trip.title}</Text>
                </View>
                <View style={[styles.destinationStatus, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
                  <Text style={[styles.destinationStatusText, { color: getStatusColor(trip.status) }]}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  mapContainer: {
    marginBottom: 20,
  },
  mapPlaceholder: {
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
  },
  continent: {
    position: 'absolute',
    backgroundColor: '#B8D4E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  continentLabel: {
    fontSize: 10,
    color: COLORS.dark,
    fontWeight: '500',
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  markerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 102, 204, 0.3)',
    top: -6,
    left: -6,
  },
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  destinationTrip: {
    fontSize: 13,
    color: COLORS.gray,
  },
  destinationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  destinationStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
