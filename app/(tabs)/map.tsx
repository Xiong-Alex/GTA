import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getTrips } from '../../lib/local-data';

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

const buildMapHtml = (trips: Trip[]) => {
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

  const markers = Object.values(grouped).map((group) => ({
    city: group.city,
    lat: group.lat,
    lng: group.lng,
    status: group.status,
    count: group.trips.length,
    trips: group.trips.map((trip) => ({
      title: trip.title,
      status: trip.status.replace('_', ' '),
      dates: `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    })),
  }));

  const markersJson = JSON.stringify(markers);

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

      if (bounds.length === 1) {
        map.setView(bounds[0], 4);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36] });
      }
    </script>
  </body>
</html>`;
};

export default function MapScreen() {
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

  const getTripsByDestination = (destination: string) => trips.filter((trip) => trip.destination === destination);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'in_progress':
        return COLORS.mediumBlue;
      default:
        return COLORS.gray;
    }
  };

  const mapWidth = width - 32;
  const mapHeight = mapWidth * 0.62;
  const activeRegions = new Set(
    trips.map((trip) => REGION_BY_CITY[trip.destination]).filter(Boolean)
  ).size;
  const mapHtml = buildMapHtml(trips);
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
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Coverage Map</Text>
          <Text style={styles.subtitle}>Monitor active destinations and regional travel demand</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{trips.length}</Text>
            <Text style={styles.summaryLabel}>Cases</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{new Set(trips.map((trip) => trip.destination)).size}</Text>
            <Text style={styles.summaryLabel}>Cities</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{activeRegions}</Text>
            <Text style={styles.summaryLabel}>Regions</Text>
          </View>
        </View>

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

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="airplane" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Tracked Cases</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
              <Ionicons name="business" size={22} color={COLORS.mediumBlue} />
            </View>
            <Text style={styles.statValue}>{activeRegions}</Text>
            <Text style={styles.statLabel}>Active Regions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="time" size={22} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{trips.filter((trip) => trip.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Awaiting Action</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destination Demand</Text>
          <Text style={styles.sectionSubtitle}>Grouped by city to highlight where travel support is concentrated.</Text>

          {Object.keys(REGION_BY_CITY).filter((city) => getTripsByDestination(city).length > 0).length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="globe-outline" size={48} color={COLORS.lightBlue} />
              </View>
              <Text style={styles.emptyText}>No mapped destinations yet</Text>
            </View>
          ) : (
            Object.keys(REGION_BY_CITY).filter((city) => getTripsByDestination(city).length > 0).map((city) => {
              const cityTrips = getTripsByDestination(city);
              return (
                <View key={city} style={styles.destinationCard}>
                  <View style={styles.destinationTop}>
                    <View style={styles.destinationInfo}>
                      <Text style={styles.destinationName}>{city}</Text>
                      <Text style={styles.destinationRegion}>{REGION_BY_CITY[city]}</Text>
                    </View>
                    <View style={styles.destinationCountBadge}>
                      <Text style={styles.destinationCountText}>{cityTrips.length} cases</Text>
                    </View>
                  </View>

                  {cityTrips.map((trip) => (
                    <View key={trip.id} style={styles.caseRow}>
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
                    </View>
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
  container: { flex: 1, backgroundColor: COLORS.background },
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
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  summaryCard: {
    marginBottom: 20,
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
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  summaryValue: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  summaryLabel: { color: COLORS.lightBlue, fontSize: 12, marginTop: 4 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 16, paddingBottom: 28 },
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
  legendTitle: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  statLabel: { fontSize: 12, color: COLORS.gray, marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  sectionSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4, lineHeight: 18, marginBottom: 12 },
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
  destinationName: { fontSize: 17, fontWeight: '700', color: COLORS.black },
  destinationRegion: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  destinationCountBadge: { backgroundColor: COLORS.primary + '12', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  destinationCountText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
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
  caseTitle: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  caseDates: { fontSize: 12, color: COLORS.gray, marginTop: 3 },
  caseStatus: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
});
