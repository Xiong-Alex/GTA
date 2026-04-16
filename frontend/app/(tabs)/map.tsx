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
      case 'approved': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'in_progress': return COLORS.mediumBlue;
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Travel Map</Text>
          <Text style={styles.subtitle}>Your destinations worldwide</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
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
                      <View style={[styles.markerPulse, { backgroundColor: getStatusColor(primaryTrip?.status || '') + '30' }]} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Map Legend */}
            <View style={styles.legend}>
              <Ionicons name="globe-outline" size={14} color={COLORS.primary} />
              <Text style={styles.legendTitle}>MOCK MAP</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="airplane" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
              <Ionicons name="location" size={22} color={COLORS.mediumBlue} />
            </View>
            <Text style={styles.statValue}>
              {new Set(trips.map(t => t.destination)).size}
            </Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="time" size={22} color={COLORS.warning} />
            </View>
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
              <View style={styles.emptyIcon}>
                <Ionicons name="globe-outline" size={48} color={COLORS.lightBlue} />
              </View>
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
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightBlue,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  mapContainer: {
    marginBottom: 20,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.darkBlue + '08',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
  },
  continent: {
    position: 'absolute',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continentLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  markerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    top: -9,
    left: -9,
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
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
    color: COLORS.black,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlue + '15',
    justifyContent: 'center',
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
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  destinationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    color: COLORS.black,
  },
  destinationTrip: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  destinationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  destinationStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
