import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTrip } from '../../lib/local-data';

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
  slate: '#3D4B66',
};

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

interface FlightSegment {
  airline: string;
  flight: string;
  departure: string;
  arrival: string;
  from: string;
  to: string;
}

type SectionKey = 'expenses' | 'health' | 'logistics' | 'context';

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    expenses: false,
    health: false,
    logistics: false,
    context: false,
  });

  useEffect(() => {
    fetchTrip();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchTrip();
    }, [id])
  );

  const fetchTrip = async () => {
    try {
      const data = await getTrip(String(id));
      setTrip(data);
    } catch (err) {
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPhase = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'Pre-Travel';
    if (now > end) return 'Closed';
    return 'Active Travel';
  };

  const getDaysUntilStart = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getAirlineWebsite = (airline: string) => {
    const normalized = airline.toLowerCase();
    if (normalized.includes('delta')) return 'https://www.delta.com';
    if (normalized.includes('ana')) return 'https://www.ana.co.jp';
    if (normalized.includes('united')) return 'https://www.united.com';
    if (normalized.includes('american')) return 'https://www.aa.com';
    if (normalized.includes('southwest')) return 'https://www.southwest.com';
    return `https://www.google.com/search?q=${encodeURIComponent(`${airline} official site`)}`;
  };

  const getFlightStatusUrl = (flight: FlightSegment) =>
    `https://www.google.com/search?q=${encodeURIComponent(`${flight.airline} ${flight.flight} flight status`)}`;

  const getFlightLegLabel = (flights: FlightSegment[], index: number) => {
    if (flights.length === 1) {
      return 'One-Way';
    }

    if (index === 0) {
      return 'Outbound';
    }

    if (index === flights.length - 1) {
      return 'Return';
    }

    return `Segment ${index + 1}`;
  };

  const handleOpenLink = async (url: string, fallbackLabel: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch (err) {
      console.error(`Unable to open ${fallbackLabel}:`, err);
    }

    Alert.alert('Link unavailable', `${fallbackLabel} could not be opened on this device right now.`);
  };

  const handlePlaceholderAction = (label: string) => {
    Alert.alert(label, 'This is a prototype action for now. The button is here to show where this workflow would live.');
  };

  const toggleSection = (key: SectionKey) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const focusSection = (key: SectionKey) => {
    const nextState: Record<SectionKey, boolean> = {
      expenses: false,
      health: false,
      logistics: false,
      context: false,
    };
    nextState[key] = true;
    setExpandedSections(nextState);
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

  const phase = getPhase(trip.start_date, trip.end_date);
  const daysUntilStart = getDaysUntilStart(trip.start_date);
  const spendPercent = trip.budget > 0 ? Math.min((trip.expenses / trip.budget) * 100, 100) : 0;
  const remaining = trip.budget - trip.expenses;
  const tripDurationDays = Math.max(
    1,
    Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))
  );
  const estimatedUnfiledExpenses = Math.max(0, Math.round(trip.expenses / Math.max(trip.flights.length + trip.hotels.length, 1)));
  const readinessItems = [
    { label: 'Transport secured', complete: trip.flights.length > 0 },
    { label: 'Accommodation secured', complete: trip.hotels.length > 0 },
    { label: 'Meeting agenda assigned', complete: trip.meetings.length > 0 },
    { label: 'Budget in range', complete: trip.expenses <= trip.budget },
  ];
  const readinessScore = Math.round(
    (readinessItems.filter((item) => item.complete).length / readinessItems.length) * 100
  );
  const riskFlags = [
    !trip.flights.length ? 'No transportation has been attached yet.' : null,
    !trip.hotels.length ? 'No accommodation has been assigned yet.' : null,
    trip.expenses > trip.budget ? 'Current expenses are above approved budget.' : null,
    trip.status === 'pending' ? 'This case is still waiting for approval.' : null,
  ].filter(Boolean) as string[];
  const lodgingStatus = trip.hotels.length ? 'Hotel assigned' : 'No hotel assigned';
  const flightStatus = trip.flights.length ? `${trip.flights.length} segment${trip.flights.length > 1 ? 's' : ''} booked` : 'No flights assigned';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Travel Case</Text>
          <TouchableOpacity style={styles.headerAction} onPress={() => router.push('/support/chat')}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <LinearGradient
          colors={['#000063', '#000A75', '#163E9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryEyebrow}>Case Summary</Text>
          <View style={styles.heroTopRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
              <Text style={styles.statusText}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.phasePill}>
              <Ionicons name="layers-outline" size={14} color={COLORS.primary} />
              <Text style={styles.phaseText}>{phase}</Text>
            </View>
          </View>

          <Text style={styles.summaryTitle}>{trip.title}</Text>
          <View style={styles.summaryMeta}>
            <Ionicons name="location" size={18} color={COLORS.lightBlue} />
            <Text style={styles.summaryDestination}>{trip.destination}</Text>
          </View>
          <Text style={styles.summarySubtitle}>
            {daysUntilStart > 0
              ? `${daysUntilStart} days until departure`
              : daysUntilStart === 0
              ? 'Departure is today'
              : `Started ${Math.abs(daysUntilStart)} days ago`}
          </Text>

          <View style={styles.summaryStats}>
            <View style={styles.heroStat}>
              <Text style={styles.summaryStatValue}>${trip.budget.toLocaleString()}</Text>
              <Text style={styles.summaryStatLabel}>Approved Budget</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.summaryStatValue}>{readinessScore}%</Text>
              <Text style={styles.summaryStatLabel}>Readiness</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.summaryStatValue}>{riskFlags.length}</Text>
              <Text style={styles.summaryStatLabel}>Active Alerts</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <Text style={styles.quickActionsSubtitle}>Fast access to the most-used workflows for this case.</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push({ pathname: '/trips/report-expense', params: { tripId: trip.id, tripTitle: trip.title } })}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Report Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push({ pathname: '/trips/calendar', params: { tripId: trip.id } })}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Trip Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => focusSection('logistics')}>
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="airplane-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>View Logistics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push({ pathname: '/trips/map', params: { tripId: trip.id } })}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="map-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Map View</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.accordionToggle} onPress={() => toggleSection('expenses')} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="wallet" size={20} color={COLORS.success} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Expenses and Budget</Text>
                <Text style={styles.cardSubtitle}>Track spend and report meals, rides, and other trip costs with receipts in one flow.</Text>
              </View>
              <Ionicons name={expandedSections.expenses ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
            </View>
          </TouchableOpacity>

          {expandedSections.expenses && (
            <>
              <View style={styles.kpiRow}>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Spent</Text>
                  <Text style={styles.kpiValue}>${trip.expenses.toLocaleString()}</Text>
                </View>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Remaining</Text>
                  <Text style={[styles.kpiValue, remaining < 0 && styles.overBudget]}>
                    ${remaining.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Utilization</Text>
                  <Text style={styles.kpiValue}>{Math.round(spendPercent)}%</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${spendPercent}%`,
                      backgroundColor: trip.expenses > trip.budget ? COLORS.error : COLORS.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressCaption}>
                {trip.expenses > trip.budget
                  ? 'Spending is above budget and should be reviewed.'
                  : 'Spending is currently within approved budget.'}
              </Text>
              <View style={styles.expenseActionRow}>
                <TouchableOpacity style={styles.primaryActionBtn} onPress={() => router.push({ pathname: '/trips/report-expense', params: { tripId: trip.id, tripTitle: trip.title } })}>
                  <Ionicons name="receipt-outline" size={16} color={COLORS.white} />
                  <Text style={styles.primaryActionBtnText}>Report Expense + Receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => handlePlaceholderAction('Expense policy')}>
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.secondaryActionBtnText}>Policy and Help</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.expenseHintRow}>
                <View style={styles.expenseHint}>
                  <Text style={styles.expenseHintLabel}>Estimated unfiled items</Text>
                  <Text style={styles.expenseHintValue}>{trip.expenses ? 2 : 0}</Text>
                </View>
                <View style={styles.expenseHint}>
                  <Text style={styles.expenseHintLabel}>Avg per trip day</Text>
                  <Text style={styles.expenseHintValue}>${Math.round(trip.expenses / tripDurationDays).toLocaleString()}</Text>
                </View>
                <View style={styles.expenseHint}>
                  <Text style={styles.expenseHintLabel}>Receipt batch</Text>
                  <Text style={styles.expenseHintValue}>${estimatedUnfiledExpenses.toLocaleString()}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.accordionToggle} onPress={() => toggleSection('health')} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
                <Ionicons name="layers-outline" size={20} color={COLORS.mediumBlue} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Trip Health</Text>
                <Text style={styles.cardSubtitle}>Readiness signals and active operational alerts in one place.</Text>
              </View>
              <Ionicons name={expandedSections.health ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
          {expandedSections.health && (
            <>
              <View style={styles.kpiRow}>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Readiness</Text>
                  <Text style={styles.kpiValue}>{readinessScore}%</Text>
                </View>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Alerts</Text>
                  <Text style={styles.kpiValue}>{riskFlags.length}</Text>
                </View>
                <View style={styles.kpiBlock}>
                  <Text style={styles.kpiLabel}>Phase</Text>
                  <Text style={styles.kpiValue}>{phase}</Text>
                </View>
              </View>
              {readinessItems.map((item) => (
                <View key={item.label} style={styles.checklistRow}>
                  <View
                    style={[
                      styles.checkIcon,
                      { backgroundColor: item.complete ? COLORS.success + '20' : COLORS.warning + '18' },
                    ]}
                  >
                    <Ionicons
                      name={item.complete ? 'checkmark' : 'time-outline'}
                      size={16}
                      color={item.complete ? COLORS.success : COLORS.warning}
                    />
                  </View>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                  <Text style={[styles.checkStatus, { color: item.complete ? COLORS.success : COLORS.warning }]}>
                    {item.complete ? 'Ready' : 'Open'}
                  </Text>
                </View>
              ))}
              {!!riskFlags.length && (
                <View style={styles.inlineAlerts}>
                  <Text style={styles.inlineAlertsTitle}>Active alerts</Text>
                  {riskFlags.map((flag) => (
                    <View key={flag} style={styles.alertRow}>
                      <View style={styles.alertDot} />
                      <Text style={styles.alertText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.accordionToggle} onPress={() => toggleSection('logistics')} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.mediumBlue + '15' }]}>
                <Ionicons name="airplane" size={20} color={COLORS.mediumBlue} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Travel Logistics</Text>
                <Text style={styles.cardSubtitle}>Flights and lodging organized in one operational view.</Text>
              </View>
              <Ionicons name={expandedSections.logistics ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
          {expandedSections.logistics && (
            <>
              <View style={styles.sectionSummaryRow}>
                <View style={styles.sectionSummaryChip}>
                  <Ionicons name="airplane-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.sectionSummaryText}>{flightStatus}</Text>
                </View>
                <View style={styles.sectionSummaryChip}>
                  <Ionicons name="bed-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.sectionSummaryText}>{lodgingStatus}</Text>
                </View>
              </View>
              <View style={styles.subsectionBlock}>
                <Text style={styles.subsectionTitle}>Flights</Text>
                <Text style={styles.subsectionDescription}>Outbound and return flight details, timing, and tracking links.</Text>
                {trip.flights.length > 0 ? (
                  <>
                    {trip.flights.map((flight, index) => (
                      <View key={index} style={[styles.flightCard, index > 0 && styles.flightCardSpacing]}>
                        <View style={styles.flightHeader}>
                          <View>
                            <View style={styles.flightLegBadge}>
                              <Text style={styles.flightLegBadgeText}>{getFlightLegLabel(trip.flights, index)}</Text>
                            </View>
                            <Text style={styles.flightAirline}>{flight.airline}</Text>
                            <Text style={styles.flightDate}>{formatDateTime(flight.departure)}</Text>
                          </View>
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
                        <View style={styles.flightActionRow}>
                          <TouchableOpacity
                            style={styles.secondaryActionBtn}
                            onPress={() => handleOpenLink(getAirlineWebsite(flight.airline), `${flight.airline} website`)}
                          >
                            <Ionicons name="globe-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.secondaryActionBtnText}>Airline Site</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.primaryActionBtn}
                            onPress={() => handleOpenLink(getFlightStatusUrl(flight), `${flight.flight} details`)}
                          >
                            <Ionicons name="open-outline" size={16} color={COLORS.white} />
                            <Text style={styles.primaryActionBtnText}>Flight Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyServiceCard}>
                    <Ionicons name="airplane-outline" size={28} color={COLORS.mediumBlue} />
                    <Text style={styles.emptyServiceTitle}>No flights attached yet</Text>
                    <Text style={styles.emptyServiceText}>Add or assign outbound and return transportation so the traveler can review details here.</Text>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => handlePlaceholderAction('Assign transportation')}>
                      <Ionicons name="add-circle-outline" size={16} color={COLORS.white} />
                      <Text style={styles.primaryActionBtnText}>Assign Transportation</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={[styles.subsectionBlock, styles.subsectionDivider]}>
                <Text style={styles.subsectionTitle}>Stay and Lodging</Text>
                <Text style={styles.subsectionDescription}>Hotel assignment, address, and support actions.</Text>
                {trip.hotels.length > 0 ? (
                  trip.hotels.map((hotel, index) => (
                    <View key={index} style={[styles.hotelCard, index > 0 && styles.hotelCardSpacing]}>
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
                      <View style={styles.hotelActionRow}>
                        <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => handlePlaceholderAction('Hotel details')}>
                          <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.secondaryActionBtnText}>Hotel Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryActionBtn} onPress={() => handlePlaceholderAction('Stay support')}>
                          <Ionicons name="help-buoy-outline" size={16} color={COLORS.white} />
                          <Text style={styles.primaryActionBtnText}>Stay Support</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyServiceCard}>
                    <Ionicons name="bed-outline" size={28} color={COLORS.lightBlue} />
                    <Text style={styles.emptyServiceTitle}>No hotel attached yet</Text>
                    <Text style={styles.emptyServiceText}>Once lodging is booked, hotel details and receipt actions will show here.</Text>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => handlePlaceholderAction('Assign stay')}>
                      <Ionicons name="add-circle-outline" size={16} color={COLORS.white} />
                      <Text style={styles.primaryActionBtnText}>Assign Stay</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.accordionToggle} onPress={() => toggleSection('context')} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.slate + '15' }]}>
                <Ionicons name="person" size={20} color={COLORS.slate} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Context and Support</Text>
                <Text style={styles.cardSubtitle}>Traveler details, purpose, meetings, notes, and related support actions.</Text>
              </View>
              <Ionicons name={expandedSections.context ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
          {expandedSections.context && (
            <>
              <View style={styles.detailGrid}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Traveler</Text>
                  <Text style={styles.detailValue}>{trip.traveler_name}</Text>
                  <Text style={styles.detailSubvalue}>{trip.traveler_email}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text style={styles.detailValue}>{trip.destination}</Text>
                  <Text style={styles.detailSubvalue}>{phase}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Start</Text>
                  <Text style={styles.detailValue}>{formatShortDate(trip.start_date)}</Text>
                  <Text style={styles.detailSubvalue}>{formatDate(trip.start_date)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>End</Text>
                  <Text style={styles.detailValue}>{formatShortDate(trip.end_date)}</Text>
                  <Text style={styles.detailSubvalue}>{formatDate(trip.end_date)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.calendarStrip}
                onPress={() => router.push({ pathname: '/trips/calendar', params: { tripId: trip.id } })}
              >
                <View style={styles.calendarStripIcon}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.calendarStripContent}>
                  <Text style={styles.calendarStripTitle}>Open Trip Calendar</Text>
                  <Text style={styles.calendarStripText}>See all trip days, flights, hotel dates, and meetings in calendar view.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              {!!trip.purpose && (
                <View style={[styles.textBlock, styles.subsectionDivider]}>
                  <Text style={styles.textBlockLabel}>Business Purpose</Text>
                  <Text style={styles.purposeText}>{trip.purpose}</Text>
                </View>
              )}
              {trip.meetings.length > 0 && (
                <View style={[styles.textBlock, styles.subsectionDivider]}>
                  <Text style={styles.textBlockLabel}>Meetings</Text>
                  {trip.meetings.map((meeting, index) => (
                    <View key={index} style={[styles.meetingItem, index > 0 && styles.meetingItemBorder]}>
                      <Text style={styles.meetingTitle}>{meeting.title}</Text>
                      <View style={styles.meetingMeta}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.meetingText}>
                          {formatDate(meeting.date)}{' '}
                          {meeting.all_day
                            ? '(All day)'
                            : meeting.start_time && meeting.end_time
                            ? `from ${meeting.start_time} to ${meeting.end_time}`
                            : `at ${meeting.start_time ?? meeting.time ?? ''}`}
                        </Text>
                      </View>
                      <View style={styles.meetingMeta}>
                        <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.meetingText}>{meeting.location}</Text>
                      </View>
                      {!!meeting.repeat && meeting.repeat !== 'Does not repeat' && (
                        <View style={styles.meetingMeta}>
                          <Ionicons name="repeat-outline" size={14} color={COLORS.gray} />
                          <Text style={styles.meetingText}>{meeting.repeat}</Text>
                        </View>
                      )}
                      {!!meeting.notes && <Text style={styles.meetingNote}>{meeting.notes}</Text>}
                      {!!meeting.url && (
                        <Text style={styles.meetingLink} numberOfLines={1}>
                          {meeting.url}
                        </Text>
                      )}
                      {!!meeting.todo_list?.length && (
                        <Text style={styles.meetingTodo} numberOfLines={2}>
                          To do: {meeting.todo_list.join(', ')}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {!!trip.notes && (
                <View style={[styles.textBlock, styles.subsectionDivider]}>
                  <Text style={styles.textBlockLabel}>Operational Notes</Text>
                  <Text style={styles.purposeText}>{trip.notes}</Text>
                </View>
              )}
              <TouchableOpacity style={[styles.supportStrip, styles.subsectionDivider]} onPress={() => router.push('/support/chat')}>
                <View style={styles.supportStripIcon}>
                  <Ionicons name="help-buoy-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.supportStripContent}>
                  <Text style={styles.supportStripTitle}>Need help with this trip?</Text>
                  <Text style={styles.supportStripText}>Open support for changes, exceptions, or traveler issues.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </>
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
  headerAction: {
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
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDestination: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 6,
  },
  summarySubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 18,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  summaryCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  summaryEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.lightBlue,
    marginBottom: 12,
  },
  quickActionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  quickActionsSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionBtn: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickActionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  accordionToggle: {
    marginHorizontal: -2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
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
    fontWeight: '700',
    color: COLORS.black,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  supportStrip: {
    marginTop: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportStripIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportStripContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  supportStripTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  supportStripText: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiBlock: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.black,
  },
  overBudget: {
    color: COLORS.error,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressCaption: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 10,
    lineHeight: 18,
  },
  expenseActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    flex: 1,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    flex: 1,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expenseHintRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  expenseHint: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
  },
  expenseHintLabel: {
    fontSize: 11,
    color: COLORS.gray,
    lineHeight: 16,
  },
  expenseHintValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 6,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 12,
    fontWeight: '500',
  },
  checkStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  inlineAlerts: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inlineAlertsTitle: {
    fontSize: 12,
    color: COLORS.gray,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  alertCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F5D48A',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A5A00',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginTop: 7,
    marginRight: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#7A5A11',
    lineHeight: 20,
  },
  sectionSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  sectionSummaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  sectionSummaryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  subsectionBlock: {
    marginTop: 6,
  },
  subsectionDivider: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  subsectionDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  flightCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 16,
  },
  flightCardSpacing: {
    marginTop: 12,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flightLegBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(45,103,255,0.10)',
    marginBottom: 10,
  },
  flightLegBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  flightAirline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
  },
  flightDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
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
  flightActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  emptyServiceCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 18,
    alignItems: 'flex-start',
  },
  emptyServiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 12,
  },
  emptyServiceText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  hotelCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 16,
  },
  hotelCardSpacing: {
    marginTop: 12,
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
  hotelActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.gray,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 8,
  },
  detailSubvalue: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  calendarStrip: {
    marginTop: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarStripIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarStripContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  calendarStripTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  calendarStripText: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 4,
  },
  textBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  textBlockLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
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
  meetingNote: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 20,
    marginTop: 10,
  },
  meetingLink: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
  },
  meetingTodo: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 8,
  },
  purposeText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
});
