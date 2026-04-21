import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { getTrip, Trip } from '../../lib/local-data';

const COLORS = {
  primary: '#0033A0',
  darkBlue: '#000063',
  lightBlue: '#328DFF',
  mediumBlue: '#2D67FF',
  white: '#FFFFFF',
  background: '#F0F4F8',
  gray: '#666666',
  black: '#000000',
  lightGray: '#E5E7EB',
  success: '#00A86B',
  warning: '#F59E0B',
};

const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
  LAX: { lat: 33.9416, lng: -118.4085 },
  JFK: { lat: 40.6413, lng: -73.7781 },
  SFO: { lat: 37.6213, lng: -122.379 },
  NRT: { lat: 35.772, lng: 140.3929 },
  LHR: { lat: 51.47, lng: -0.4543 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  DXB: { lat: 25.2532, lng: 55.3657 },
};

const KNOWN_LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  '1535 broadway, new york': { lat: 40.7585, lng: -73.9851 },
  'new york marriott marquis': { lat: 40.7585, lng: -73.9851 },
  '3-7-1-2 nishi shinjuku': { lat: 35.685, lng: 139.6922 },
  'park hyatt tokyo': { lat: 35.685, lng: 139.6922 },
  '22-28 broadway, london': { lat: 51.4994, lng: -0.1294 },
  'conrad london st. james': { lat: 51.4994, lng: -0.1294 },
  '15 rue boissy d\'anglas': { lat: 48.8703, lng: 2.3216 },
  'sofitel le faubourg': { lat: 48.8703, lng: 2.3216 },
  'station f': { lat: 48.8339, lng: 2.3708 },
  '10 bayfront avenue, singapore': { lat: 1.2834, lng: 103.8607 },
  'marina bay sands': { lat: 1.2834, lng: 103.8607 },
  'sheikh zayed road, business bay': { lat: 25.183, lng: 55.2661 },
  'jw marriott marquis dubai': { lat: 25.183, lng: 55.2661 },
};

type MapPointType = 'meeting' | 'hotel' | 'flight' | 'base';

type MapPoint = {
  id: string;
  type: MapPointType;
  dateKey: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  sortMinutes: number;
  lat: number;
  lng: number;
};

const FULL_TRIP_KEY = '__full_trip__';

const { width } = Dimensions.get('window');

const getIsoDateKey = (value: string) => value.split('T')[0];

const formatDateLabel = (dateKey: string) =>
  new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (value?: string | null) => {
  if (!value) return 9 * 60;
  const lower = value.trim().toLowerCase();
  if (!lower || lower === 'all day') return 9 * 60;

  const ampm = lower.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (ampm) {
    const hoursRaw = Number(ampm[1]);
    const mins = Number(ampm[2]);
    const meridiem = ampm[3];
    const hours = meridiem === 'pm' ? (hoursRaw % 12) + 12 : hoursRaw % 12;
    return hours * 60 + mins;
  }

  const h24 = lower.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    return Number(h24[1]) * 60 + Number(h24[2]);
  }

  return 9 * 60;
};

const minutesToLabel = (minutes: number) => {
  const hrs24 = Math.max(0, Math.floor(minutes / 60) % 24);
  const mins = Math.max(0, minutes % 60);
  const ampm = hrs24 >= 12 ? 'PM' : 'AM';
  const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
  return `${hrs12}:${`${mins}`.padStart(2, '0')} ${ampm}`;
};

const seedToOffset = (seed: string, range = 0.1) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((Math.abs(hash) % 1000) / 1000 - 0.5) * range;
};

const pseudoPoint = (base: { lat: number; lng: number }, seed: string) => ({
  lat: base.lat + seedToOffset(`${seed}-lat`, 0.018),
  lng: base.lng + seedToOffset(`${seed}-lng`, 0.024),
});

const resolveLocationPoint = (base: { lat: number; lng: number }, locationText: string | undefined, seed: string) => {
  const normalized = (locationText ?? '').trim().toLowerCase();
  if (normalized) {
    for (const key of Object.keys(KNOWN_LOCATION_COORDS)) {
      if (normalized.includes(key)) {
        return KNOWN_LOCATION_COORDS[key];
      }
    }
  }
  return pseudoPoint(base, seed);
};

const pointColor = (type: MapPointType) => {
  switch (type) {
    case 'meeting':
      return '#00A86B';
    case 'hotel':
      return '#2D67FF';
    case 'flight':
      return '#F59E0B';
    default:
      return '#0033A0';
  }
};

const pointIcon = (type: MapPointType) => {
  switch (type) {
    case 'meeting':
      return 'briefcase-outline';
    case 'hotel':
      return 'bed-outline';
    case 'flight':
      return 'airplane-outline';
    default:
      return 'location-outline';
  }
};

const buildItineraryByDate = (trip: Trip) => {
  const itinerary: Record<string, MapPoint[]> = {};
  const base = trip.coordinates;

  const pushPoint = (date: string, point: MapPoint) => {
    if (!itinerary[date]) itinerary[date] = [];
    itinerary[date].push(point);
  };

  trip.meetings.forEach((meeting, index) => {
    const date = getIsoDateKey(meeting.date);
    const timeMinutes = meeting.all_day
      ? 9 * 60
      : timeToMinutes(meeting.start_time ?? meeting.time ?? null);
    const locationSeed = meeting.location || `meeting-${index}`;
    const position = resolveLocationPoint(base, meeting.location, locationSeed);
    pushPoint(date, {
      id: `meeting-${index}`,
      type: 'meeting',
      dateKey: date,
      title: meeting.title,
      subtitle: meeting.location || trip.destination,
      timeLabel: meeting.all_day ? 'All day' : minutesToLabel(timeMinutes),
      sortMinutes: timeMinutes,
      lat: position.lat,
      lng: position.lng,
    });
  });

  trip.hotels.forEach((hotel, index) => {
    const hotelPos = resolveLocationPoint(base, hotel.address || hotel.name, hotel.address || hotel.name || `hotel-${index}`);
    const checkinDate = getIsoDateKey(hotel.checkin);
    pushPoint(checkinDate, {
      id: `hotel-in-${index}`,
      type: 'hotel',
      dateKey: checkinDate,
      title: `Hotel Check-in: ${hotel.name}`,
      subtitle: hotel.address || trip.destination,
      timeLabel: '3:00 PM',
      sortMinutes: 15 * 60,
      lat: hotelPos.lat,
      lng: hotelPos.lng,
    });

    const checkoutDate = getIsoDateKey(hotel.checkout);
    pushPoint(checkoutDate, {
      id: `hotel-out-${index}`,
      type: 'hotel',
      dateKey: checkoutDate,
      title: `Hotel Check-out: ${hotel.name}`,
      subtitle: hotel.address || trip.destination,
      timeLabel: '11:00 AM',
      sortMinutes: 11 * 60,
      lat: hotelPos.lat,
      lng: hotelPos.lng,
    });
  });

  trip.flights.forEach((flight, index) => {
    const departureDate = getIsoDateKey(flight.departure);
    const departure = new Date(flight.departure);
    const departureMinutes = departure.getHours() * 60 + departure.getMinutes();
    const fromPoint = AIRPORT_COORDS[flight.from] ?? pseudoPoint(base, `${flight.from}-from-${index}`);
    pushPoint(departureDate, {
      id: `flight-depart-${index}`,
      type: 'flight',
      dateKey: departureDate,
      title: `Depart ${flight.from} (${flight.flight})`,
      subtitle: `${flight.airline} to ${flight.to}`,
      timeLabel: minutesToLabel(departureMinutes),
      sortMinutes: departureMinutes,
      lat: fromPoint.lat,
      lng: fromPoint.lng,
    });

    const arrivalDate = getIsoDateKey(flight.arrival);
    const arrival = new Date(flight.arrival);
    const arrivalMinutes = arrival.getHours() * 60 + arrival.getMinutes();
    const toPoint = AIRPORT_COORDS[flight.to] ?? pseudoPoint(base, `${flight.to}-to-${index}`);
    pushPoint(arrivalDate, {
      id: `flight-arrive-${index}`,
      type: 'flight',
      dateKey: arrivalDate,
      title: `Arrive ${flight.to} (${flight.flight})`,
      subtitle: `${flight.airline} from ${flight.from}`,
      timeLabel: minutesToLabel(arrivalMinutes),
      sortMinutes: arrivalMinutes,
      lat: toPoint.lat,
      lng: toPoint.lng,
    });
  });

  Object.keys(itinerary).forEach((date) => {
    itinerary[date] = itinerary[date].sort((a, b) => a.sortMinutes - b.sortMinutes || a.title.localeCompare(b.title));
  });

  return itinerary;
};

const buildMapHtml = (points: MapPoint[], fallbackCenter: { lat: number; lng: number }) => {
  const pointsJson = JSON.stringify(points);
  const center = JSON.stringify(fallbackCenter);
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
      .marker-pin {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        border: 2px solid #fff;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 6px 14px rgba(0,0,0,0.22);
      }
      .popup-title { font-size: 13px; font-weight: 700; color: #000; }
      .popup-sub { font-size: 12px; color: #666; margin-top: 4px; max-width: 220px; }
      .popup-time { font-size: 12px; color: #0033A0; margin-top: 6px; font-weight: 700; }
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
      const points = ${pointsJson};
      const fallback = ${center};
      const map = L.map('map', { zoomControl: true, worldCopyJump: true }).setView([fallback.lat, fallback.lng], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const routeBounds = [];
      const overlapByCoord = {};
      points.forEach((point) => {
        const key = point.lat.toFixed(5) + ',' + point.lng.toFixed(5);
        if (!overlapByCoord[key]) overlapByCoord[key] = [];
        overlapByCoord[key].push(point);
      });

      const markerPoints = points.map((point) => {
        const key = point.lat.toFixed(5) + ',' + point.lng.toFixed(5);
        const cluster = overlapByCoord[key];

        if (!cluster || cluster.length <= 1) {
          return { ...point, markerLat: point.lat, markerLng: point.lng };
        }

        const indexInCluster = cluster.findIndex((candidate) => candidate.id === point.id);
        const angle = (Math.PI * 2 * indexInCluster) / cluster.length;
        const radius = 0.0012;

        return {
          ...point,
          markerLat: point.lat + Math.cos(angle) * radius,
          markerLng: point.lng + Math.sin(angle) * radius,
        };
      });

      const markerBounds = markerPoints.map((point) => [point.markerLat, point.markerLng]);

      const addBounds = (latLngs) => {
        latLngs.forEach((latLng) => routeBounds.push(latLng));
      };

      const drawSegment = async (start, end) => {
        const startLatLng = [start.lat, start.lng];
        const endLatLng = [end.lat, end.lng];
        const isFlightSegment = start.type === 'flight' || end.type === 'flight';

        if (isFlightSegment) {
          L.polyline([startLatLng, endLatLng], {
            color: '#5B6B8A',
            weight: 4,
            opacity: 0.82,
            dashArray: '8 10'
          }).addTo(map);
          addBounds([startLatLng, endLatLng]);
          return;
        }

        const routeUrl =
          'https://router.project-osrm.org/route/v1/driving/' +
          start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat +
          '?overview=full&geometries=geojson';

        try {
          const response = await fetch(routeUrl);
          if (!response.ok) throw new Error('Route request failed');
          const data = await response.json();
          const coordinates = data && data.routes && data.routes[0] && data.routes[0].geometry
            ? data.routes[0].geometry.coordinates
            : null;

          if (Array.isArray(coordinates) && coordinates.length > 1) {
            const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);
            L.polyline(latLngs, {
              color: '#0033A0',
              weight: 5,
              opacity: 0.9
            }).addTo(map);
            addBounds(latLngs);
            return;
          }
        } catch (error) {}

        L.polyline([startLatLng, endLatLng], {
          color: '#0033A0',
          weight: 4,
          opacity: 0.78
        }).addTo(map);
        addBounds([startLatLng, endLatLng]);
      };

      const renderRoutes = async () => {
        for (let i = 0; i < points.length - 1; i += 1) {
          await drawSegment(points[i], points[i + 1]);
        }

        const bounds = routeBounds.length ? routeBounds : markerBounds;
        if (bounds.length === 1) {
          map.setView(bounds[0], 11);
        } else if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [36, 36] });
        }
      };

      markerPoints.forEach((point, index) => {
        const icon = L.divIcon({
          className: '',
          html: '<div class="marker-pin" style="background:' + point.color + ';">' + (index + 1) + '</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -10]
        });
        const popup = '<div class="popup-title">' + point.title + '</div>' +
          '<div class="popup-sub">' + point.subtitle + '</div>' +
          '<div class="popup-time">' + point.timeLabel + '</div>';
        L.marker([point.markerLat, point.markerLng], { icon }).addTo(map).bindPopup(popup);
      });

      renderRoutes();
    </script>
  </body>
</html>`;
};

export default function TripMapScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const loadTrip = useCallback(async () => {
    try {
      if (!tripId) return;
      const data = await getTrip(String(tripId));
      setTrip(data);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  useFocusEffect(
    useCallback(() => {
      loadTrip();
    }, [loadTrip])
  );

  const itineraryByDate = useMemo(() => (trip ? buildItineraryByDate(trip) : {}), [trip]);
  const availableDates = useMemo(() => Object.keys(itineraryByDate).sort(), [itineraryByDate]);
  const allTripPoints = useMemo(
    () => availableDates.flatMap((date) => itineraryByDate[date] ?? []),
    [availableDates, itineraryByDate]
  );
  const today = todayKey();

  useEffect(() => {
    if (selectedDate && (selectedDate === FULL_TRIP_KEY || availableDates.includes(selectedDate))) {
      return;
    }

    if (!availableDates.length) {
      setSelectedDate(today);
      return;
    }
    if (availableDates.includes(today)) {
      setSelectedDate(today);
      return;
    }
    const nextDate = availableDates.find((date) => date >= today) ?? availableDates[availableDates.length - 1];
    setSelectedDate(nextDate);
  }, [availableDates, selectedDate, today]);

  const dayPoints = selectedDate === FULL_TRIP_KEY ? allTripPoints : itineraryByDate[selectedDate] ?? [];
  const pointsWithStyle = dayPoints.map((point) => ({ ...point, color: pointColor(point.type) }));
  const mapHtml = buildMapHtml(pointsWithStyle, trip?.coordinates ?? { lat: 20, lng: 0 });
  const mapWidth = width - 32;
  const mapHeight = Math.round(Dimensions.get('window').height * 0.33);
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

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Trip map unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Map</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Visual Itinerary</Text>
          <Text style={styles.heroTitle}>{trip.title}</Text>
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            Map view of route flow between flights, lodging, and events.
          </Text>
        </View>

        {!!availableDates.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRail}>
            <TouchableOpacity
              key={FULL_TRIP_KEY}
              style={[styles.dateChip, selectedDate === FULL_TRIP_KEY && styles.dateChipSelected]}
              onPress={() => setSelectedDate(FULL_TRIP_KEY)}
            >
              <Text style={[styles.dateChipText, selectedDate === FULL_TRIP_KEY && styles.dateChipTextSelected]}>Full Trip</Text>
            </TouchableOpacity>
            {availableDates.map((date) => {
              const isSelected = date === selectedDate;
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                    {date === today ? `Today • ${formatDateLabel(date)}` : formatDateLabel(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.mapWrap}>
          <View style={[styles.mapCard, { width: mapWidth, height: mapHeight }]}>
            {isWeb ? (
              React.createElement('iframe', {
                srcDoc: mapHtml,
                style: styles.mapFrame as any,
                title: 'Trip map',
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
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>Flights</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.mediumBlue }]} />
            <Text style={styles.legendText}>Hotels</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Events</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {selectedDate === FULL_TRIP_KEY
              ? 'Full Trip Route Plan'
              : selectedDate === today
              ? "Today's Route Plan"
              : `Route Plan • ${formatDateLabel(selectedDate)}`}
          </Text>
          {!dayPoints.length ? (
            <Text style={styles.emptyStateText}>No scheduled stops on this day yet. Add an event and it will appear on this map.</Text>
          ) : (
            dayPoints.map((point, index) => (
              <View key={point.id} style={[styles.stopRow, index > 0 && styles.stopRowBorder]}>
                <View style={[styles.stopIcon, { backgroundColor: `${pointColor(point.type)}18` }]}>
                  <Ionicons name={pointIcon(point.type)} size={16} color={pointColor(point.type)} />
                </View>
                <View style={styles.stopContent}>
                  <Text style={styles.stopTitle}>{point.title}</Text>
                  <Text style={styles.stopSubtitle} numberOfLines={1}>
                    {point.subtitle}
                  </Text>
                </View>
                <Text style={styles.stopTime}>
                  {selectedDate === FULL_TRIP_KEY ? `${formatDateLabel(point.dateKey)} • ${point.timeLabel}` : point.timeLabel}
                </Text>
              </View>
            ))
          )}
        </View>
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
    padding: 18,
    marginBottom: 12,
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
    color: 'rgba(255,255,255,0.78)',
    marginTop: 8,
    lineHeight: 20,
  },
  dateRail: {
    paddingVertical: 4,
    paddingBottom: 10,
    paddingRight: 8,
    gap: 8,
  },
  dateChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateChipTextSelected: {
    color: COLORS.white,
  },
  mapWrap: { marginBottom: 10 },
  mapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '18',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  stopRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  stopIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  stopTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
  },
  stopSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
