import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
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
  lightGray: '#E5E7EB',
  success: '#00A86B',
  warning: '#F59E0B',
};

const { width, height } = Dimensions.get('window');

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  coordinates: { lat: number; lng: number };
}

const REGION_BY_CITY: Record<string, string> = {
  'New York': 'Americas',
  London: 'Europe',
  Paris: 'Europe',
  Tokyo: 'Asia',
  Sydney: 'Oceania',
  Dubai: 'Middle East',
  Singapore: 'Asia',
  'San Francisco': 'Americas',
};

const STATUS_RANK: Record<string, number> = {
  active: 0,
  in_progress: 0,
  approved: 1,
  pending: 2,
  completed: 3,
};

const toDateOnly = (value: string) => new Date(`${value}T00:00:00`);

const isActiveTrip = (trip: Trip) => {
  if (trip.status === 'active' || trip.status === 'in_progress') return true;
  if (trip.status === 'completed') return false;

  const now = new Date();
  const start = toDateOnly(trip.start_date);
  const end = toDateOnly(trip.end_date);
  return now >= start && now <= end;
};

const buildMapHtml = (trips: Trip[], focusCoords: { lat: number; lng: number }[]) => {
  const grouped = trips.reduce<Record<string, { city: string; lat: number; lng: number; status: string; trips: Trip[] }>>(
    (acc, trip) => {
      const key = `${trip.destination}-${trip.coordinates.lat}-${trip.coordinates.lng}`;
      if (!acc[key]) {
        acc[key] = {
          city: trip.destination,
          lat: trip.coordinates.lat,
          lng: trip.coordinates.lng,
          status: trip.status,
          trips: [],
        };
      }
      acc[key].trips.push(trip);
      return acc;
    },
    {}
  );

  const markers = Object.values(grouped).map((group) => {
    const sortedTrips = [...group.trips].sort(
      (a, b) => (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99)
    );
    const markerStatus = sortedTrips[0]?.status ?? group.status;

    return {
      city: group.city,
      lat: group.lat,
      lng: group.lng,
      status: markerStatus,
      count: group.trips.length,
      trips: sortedTrips.map((trip) => ({
        title: trip.title,
        status: trip.status.replace('_', ' '),
        dates: `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      })),
    };
  });

  const markersJson = JSON.stringify(markers);
  const focusCoordsJson = JSON.stringify(focusCoords);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; background: #f0f4f8; }
      .leaflet-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .popup-shell { min-width: 190px; }
      .popup-city { font-size: 15px; font-weight: 700; color: #000000; margin-bottom: 4px; }
      .popup-meta { font-size: 12px; color: #666666; margin-bottom: 10px; }
      .popup-trip { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; }
      .popup-trip:first-of-type { border-top: 0; padding-top: 0; margin-top: 0; }
      .popup-title { font-size: 13px; font-weight: 700; color: #0033A0; }
      .popup-sub { font-size: 12px; color: #666666; margin-top: 2px; }
      .marker-pin {
        background: #0033A0;
        border: 3px solid white;
        color: white;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 18px rgba(0, 51, 160, 0.25);
        font-size: 11px;
        font-weight: 700;
      }
      .status-approved { background: #00A86B; }
      .status-pending { background: #F59E0B; }
      .status-active { background: #2D67FF; }
      .status-in_progress { background: #2D67FF; }
      .status-completed { background: #666666; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const markers = ${markersJson};
      const focusCoords = ${focusCoordsJson};
      const map = L.map('map', {
        zoomControl: true,
        worldCopyJump: true
      }).setView([20, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const bounds = [];

      markers.forEach((marker) => {
        bounds.push([marker.lat, marker.lng]);
        const icon = L.divIcon({
          className: '',
          html: '<div class="marker-pin status-' + marker.status + '">' + marker.count + '</div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -10]
        });

        const popupTrips = marker.trips.map((trip) =>
          '<div class="popup-trip">' +
            '<div class="popup-title">' + trip.title + '</div>' +
            '<div class="popup-sub">' + trip.status + '</div>' +
            '<div class="popup-sub">' + trip.dates + '</div>' +
          '</div>'
        ).join('');

        const popup = '<div class="popup-shell">' +
          '<div class="popup-city">' + marker.city + '</div>' +
          '<div class="popup-meta">' + marker.count + ' active case' + (marker.count > 1 ? 's' : '') + '</div>' +
          popupTrips +
        '</div>';

        L.marker([marker.lat, marker.lng], { icon }).addTo(map).bindPopup(popup);
      });

      const focusBounds = focusCoords.map((point) => [point.lat, point.lng]);
      const viewportBounds = focusBounds.length ? focusBounds : bounds;

      if (viewportBounds.length === 1) {
        map.setView(viewportBounds[0], 5);
      } else if (viewportBounds.length > 1) {
        map.fitBounds(viewportBounds, { padding: [56, 56], maxZoom: 5 });
      }
    </script>
  </body>
</html>`;
};

export default function MapScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'active':
      case 'in_progress':
        return COLORS.mediumBlue;
      case 'completed':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const locationPriority = useMemo(() => {
    const today = new Date();
    const futureCutoff = new Date(`${today.toISOString().split('T')[0]}T00:00:00`);

    const cities = Object.keys(REGION_BY_CITY)
      .map((city) => {
        const cityTrips = trips.filter((trip) => trip.destination === city);
        if (!cityTrips.length) return null;

        const activeTrips = cityTrips.filter((trip) => isActiveTrip(trip));
        const upcomingTrips = cityTrips
          .filter((trip) => toDateOnly(trip.start_date) >= futureCutoff && trip.status !== 'completed')
          .sort((a, b) => a.start_date.localeCompare(b.start_date));
        const nextTrip = upcomingTrips[0] ?? null;
        const topStatus =
          [...cityTrips].sort((a, b) => (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99))[0]?.status ?? 'completed';

        return {
          city,
          region: REGION_BY_CITY[city],
          trips: cityTrips,
          activeCount: activeTrips.length,
          nextTrip,
          topStatus,
        };
      })
      .filter(Boolean) as {
      city: string;
      region: string;
      trips: Trip[];
      activeCount: number;
      nextTrip: Trip | null;
      topStatus: string;
    }[];

    return cities.sort((a, b) => {
      const aActive = a.activeCount > 0 ? 0 : 1;
      const bActive = b.activeCount > 0 ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;

      const aNext = a.nextTrip?.start_date ?? '9999-12-31';
      const bNext = b.nextTrip?.start_date ?? '9999-12-31';
      if (aNext !== bNext) return aNext.localeCompare(bNext);

      return a.city.localeCompare(b.city);
    });
  }, [trips]);

  const focusLocation = locationPriority[0] ?? null;
  const viewportFocusCoords = useMemo(() => {
    const activeTrips = trips.filter((trip) => isActiveTrip(trip));
    const latestTrip = [...trips].sort((a, b) => b.start_date.localeCompare(a.start_date))[0] ?? null;

    const focusTrips = [...activeTrips];
    if (latestTrip && !focusTrips.some((trip) => trip.id === latestTrip.id)) {
      focusTrips.push(latestTrip);
    }

    const uniqueByCoord = new Map<string, { lat: number; lng: number }>();
    focusTrips.forEach((trip) => {
      const key = `${trip.coordinates.lat.toFixed(4)},${trip.coordinates.lng.toFixed(4)}`;
      if (!uniqueByCoord.has(key)) {
        uniqueByCoord.set(key, trip.coordinates);
      }
    });

    return Array.from(uniqueByCoord.values());
  }, [trips]);

  const mapWidth = width - 32;
  const mapHeight = Math.round(height * 0.33);
  const mapHtml = buildMapHtml(trips, viewportFocusCoords);
  const isWeb = Platform.OS === 'web';

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
          <Text style={styles.title}>Coverage Map</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Monitor active destinations and regional travel demand
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.mapContainer}>
          <View style={[styles.mapPlaceholder, { width: mapWidth, height: mapHeight }]}>
            {isWeb ? (
              React.createElement('iframe', {
                srcDoc: mapHtml,
                style: styles.mapFrame as any,
                title: 'Coverage map',
              })
            ) : (
              <WebView
                source={{ html: mapHtml }}
                originWhitelist={['*']}
                style={styles.mapWebView}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
            <View style={styles.legend}>
              <Ionicons name="globe-outline" size={14} color={COLORS.primary} />
              <Text style={styles.legendTitle}>LIVE DESTINATION MAP</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destination Demand</Text>
          <Text style={styles.sectionSubtitle}>Prioritized by active locations first, then next upcoming destinations.</Text>

          {focusLocation && (
            <LinearGradient
              colors={['#000063', '#000A75', '#163E9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.focusCard}
            >
              <View style={[styles.focusDot, { backgroundColor: getStatusColor(focusLocation.topStatus) }]} />
              <View style={styles.focusContent}>
                <Text style={styles.focusLabel}>Current Focus</Text>
                <Text style={styles.focusTitle}>{focusLocation.city}</Text>
                <Text style={styles.focusText}>
                  {focusLocation.activeCount > 0
                    ? `${focusLocation.activeCount} active case${focusLocation.activeCount > 1 ? 's' : ''} in progress now.`
                    : focusLocation.nextTrip
                    ? `Next departure: ${new Date(focusLocation.nextTrip.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}.`
                    : 'No upcoming departures scheduled.'}
                </Text>
              </View>
            </LinearGradient>
          )}

          {locationPriority.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="globe-outline" size={48} color={COLORS.lightBlue} />
              </View>
              <Text style={styles.emptyText}>No mapped destinations yet</Text>
            </View>
          ) : (
            locationPriority.map((location) => {
              const cityTrips = location.trips;
              return (
                <View key={location.city} style={styles.destinationCard}>
                  <View style={styles.destinationTop}>
                    <View style={styles.destinationInfo}>
                      <Text style={styles.destinationName}>{location.city}</Text>
                      <Text style={styles.destinationRegion}>{location.region}</Text>
                    </View>
                    <View style={[styles.destinationCountBadge, { backgroundColor: getStatusColor(location.topStatus) + '15' }]}>
                      <Text style={styles.destinationCountText}>{cityTrips.length} cases</Text>
                    </View>
                  </View>
                  <View style={styles.locationPriorityStrip}>
                    <Ionicons
                      name={location.activeCount > 0 ? 'flash-outline' : 'calendar-outline'}
                      size={13}
                      color={COLORS.primary}
                    />
                    <Text style={styles.locationPriorityText}>
                      {location.activeCount > 0
                        ? `${location.activeCount} active case${location.activeCount > 1 ? 's' : ''}`
                        : location.nextTrip
                        ? `Next: ${new Date(location.nextTrip.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}`
                        : 'No upcoming departures'}
                    </Text>
                  </View>

                  {cityTrips.map((trip) => (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.caseRow}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/trips/${trip.id}`)}
                    >
                      <View style={[styles.caseDot, { backgroundColor: getStatusColor(trip.status) }]} />
                      <View style={styles.caseContent}>
                        <Text style={styles.caseTitle}>{trip.title}</Text>
                        <Text style={styles.caseDates}>
                          {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                          {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={[styles.caseStatus, { color: getStatusColor(trip.status) }]}>
                        {trip.status.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
          )}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 18,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 18, paddingBottom: 30 },
  mapContainer: { marginBottom: 20 },
  mapPlaceholder: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  mapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendTitle: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  sectionSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4, lineHeight: 19, marginBottom: 12 },
  focusCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  focusContent: { flex: 1 },
  focusLabel: { fontSize: 11, fontWeight: '700', color: COLORS.lightBlue, textTransform: 'uppercase' },
  focusTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginTop: 2 },
  focusText: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 4, lineHeight: 18 },
  emptyState: { backgroundColor: COLORS.white, borderRadius: 18, padding: 32, alignItems: 'center' },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { marginTop: 12, fontSize: 14, color: COLORS.gray },
  destinationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  destinationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  destinationInfo: {},
  destinationName: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  destinationRegion: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  destinationCountBadge: { backgroundColor: COLORS.primary + '12', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  destinationCountText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  locationPriorityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  locationPriorityText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  caseDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  caseContent: { flex: 1 },
  caseTitle: { fontSize: 15, fontWeight: '600', color: COLORS.black, lineHeight: 20 },
  caseDates: { fontSize: 12, color: COLORS.gray, marginTop: 3 },
  caseStatus: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
});
