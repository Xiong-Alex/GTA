import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FAQItem, getFaqs, getTrips, getUnreadNotificationCount, resetDemoData } from '../../lib/local-data';
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
  flights?: Array<{
    airline: string;
    flight: string;
    departure: string;
    arrival: string;
    from: string;
    to: string;
  }>;
  hotels?: Array<{
    name: string;
    checkin: string;
    checkout: string;
    address: string;
  }>;
  meetings?: Array<{
    title: string;
    date: string;
    location: string;
    start_time?: string;
    end_time?: string;
    time?: string;
    all_day?: boolean;
  }>;
}

type SearchScope = 'all' | 'trips' | 'events' | 'support' | 'faq' | 'chat';

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  params?: Record<string, string>;
};

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const searchScope: SearchScope = 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      const trips = await getTrips();
      setAllTrips(trips);
      setUpcomingTrips(trips.slice(0, 3));
      const faqItems = await getFaqs();
      setFaqs(faqItems);
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load local demo data');
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
      await resetDemoData();
      await fetchData();
    } catch (err) {
      console.error('Error seeding data:', err);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const quickActions = [
    { label: 'Open Case', helper: 'Create request', icon: 'add-circle', color: COLORS.primary, route: '/trips/new' },
    { label: 'Support', helper: 'Get help fast', icon: 'chatbubble-ellipses', color: COLORS.mediumBlue, route: '/support/chat' },
    { label: 'FAQ', helper: 'Browse answers', icon: 'help-circle', color: COLORS.lightBlue, route: '/support/faq' },
    { label: 'Feedback', helper: 'Share notes', icon: 'document-text', color: COLORS.slate, route: '/profile/feedback' },
  ];

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [] as SearchResult[];

    const matches = (value: string) => value.toLowerCase().includes(query);
    const inScope = (target: Exclude<SearchScope, 'all'>) => searchScope === 'all' || searchScope === target;
    const results: SearchResult[] = [];

    if (inScope('trips')) {
      allTrips.forEach((trip) => {
        if ([trip.title, trip.destination, trip.status].some(matches)) {
          results.push({
            id: `trip-${trip.id}`,
            title: trip.title,
            subtitle: `${trip.destination} • ${trip.status.replace('_', ' ')}`,
            icon: 'briefcase-outline',
            route: `/trips/${trip.id}`,
          });
        }
      });
    }

    if (inScope('events')) {
      allTrips.forEach((trip) => {
        trip.meetings?.forEach((meeting, index) => {
          const eventText = `${meeting.title} ${meeting.location} ${meeting.date} ${trip.title}`;
          if (matches(eventText)) {
            results.push({
              id: `event-${trip.id}-${index}`,
              title: meeting.title,
              subtitle: `${trip.title} • ${meeting.location || trip.destination}`,
              icon: 'calendar-outline',
              route: '/trips/calendar',
              params: { tripId: trip.id },
            });
          }
        });
      });
    }

    if (inScope('support')) {
      const supportItems: SearchResult[] = [
        {
          id: 'support-center',
          title: 'Support Center',
          subtitle: 'Channels and quick contacts',
          icon: 'help-buoy-outline',
          route: '/support',
        },
        {
          id: 'support-chat',
          title: 'Chat Support',
          subtitle: 'Open live operations assistant',
          icon: 'chatbubble-ellipses-outline',
          route: '/support/chat',
        },
      ];
      supportItems.forEach((item) => {
        if (matches(`${item.title} ${item.subtitle} support help`)) {
          results.push(item);
        }
      });
    }

    if (inScope('faq')) {
      faqs.forEach((faq) => {
        if (matches(`${faq.question} ${faq.answer} ${faq.category}`)) {
          results.push({
            id: `faq-${faq.id}`,
            title: faq.question,
            subtitle: `FAQ • ${faq.category}`,
            icon: 'help-circle-outline',
            route: '/support/faq',
          });
        }
      });
    }

    if (inScope('chat')) {
      if (matches('chat support assistant travel policy help')) {
        results.push({
          id: 'chat-direct',
          title: 'Open Chat Support',
          subtitle: 'Ask travel, booking, or policy questions',
          icon: 'chatbox-ellipses-outline',
          route: '/support/chat',
        });
      }
    }

    const deduped = new Map<string, SearchResult>();
    results.forEach((item) => {
      if (!deduped.has(item.id)) deduped.set(item.id, item);
    });

    return Array.from(deduped.values()).slice(0, 7);
  }, [allTrips, faqs, searchQuery, searchScope]);

  const handleSearchResultPress = (result: SearchResult) => {
    setSearchQuery('');
    if (result.params) {
      router.push({ pathname: result.route as never, params: result.params } as never);
      return;
    }
    router.push(result.route as never);
  };

  const handleSearchSubmit = () => {
    if (searchResults.length) {
      handleSearchResultPress(searchResults[0]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabScreenBackground />
      <View style={styles.headerShell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Business Travel</Text>
            <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
              Manage your corporate trips
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.searchShell}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={16} color={COLORS.gray} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Search trips or resources"
              placeholderTextColor="#9AA3B2"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
          {!!searchQuery.trim() && (
            <View style={styles.searchResultsCard}>
              {searchResults.length ? (
                searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultRow}
                    onPress={() => handleSearchResultPress(result)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.searchResultIcon}>
                      <Ionicons name={result.icon} size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.searchResultTextWrap}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>
                        {result.title}
                      </Text>
                      <Text style={styles.searchResultSubtitle} numberOfLines={1}>
                        {result.subtitle}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.gray} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.searchEmptyText}>No matches found. Try another keyword or scope.</Text>
              )}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <LinearGradient
          colors={['#000063', '#000A75', '#163E9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEyebrow}>Today&apos;s snapshot</Text>
          <Text style={styles.heroTitle}>Track employee travel cases, approvals, and service coverage in one place.</Text>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionHelper}>Common travel operations</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.label}</Text>
                <Text style={styles.actionHelper}>{action.helper}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Priority Cases</Text>
              <Text style={styles.sectionHelper}>Upcoming employee travel activity</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trips')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={42} color={COLORS.lightBlue} />
              </View>
              <Text style={styles.emptyTitle}>No travel cases loaded</Text>
              <Text style={styles.emptySubtitle}>Seed the local demo data to explore the prototype.</Text>
              <TouchableOpacity style={styles.seedBtn} onPress={seedData}>
                <Text style={styles.seedBtnText}>Load Demo Data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingTrips.map((trip) => {
              const serviceCount = (trip.flights?.length || 0) + (trip.hotels?.length || 0);
              return (
                <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => router.push(`/trips/${trip.id}`)}>
                  <View style={styles.tripTopRow}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '18' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                  </View>

                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <View style={styles.tripMetaRow}>
                    <View style={styles.tripMeta}>
                      <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.tripMetaText}>{trip.destination}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.tripMetaText}>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripSummaryRow}>
                    <View style={styles.tripSummaryBlock}>
                      <Text style={styles.tripSummaryLabel}>Budget</Text>
                      <Text style={styles.tripSummaryValue}>${trip.budget.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tripSummaryBlock}>
                      <Text style={styles.tripSummaryLabel}>Spent</Text>
                      <Text style={styles.tripSummaryValue}>${trip.expenses.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tripSummaryBlock}>
                      <Text style={styles.tripSummaryLabel}>Services</Text>
                      <Text style={styles.tripSummaryValue}>{serviceCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.helpSection}>
          <View style={styles.helpContent}>
            <View style={styles.helpIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.white} />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need routing or policy help?</Text>
              <Text style={styles.helpSubtitle}>Use the demo assistant to answer travel and expense questions.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.helpBtn} onPress={() => router.push('/support/chat')}>
            <Text style={styles.helpBtnText}>Open Support</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.gray, fontSize: 16 },
  headerShell: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchShell: {
    marginTop: 10,
    paddingHorizontal: 20,
    zIndex: 12,
  },
  searchInputWrap: {
    height: 42,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.black,
    paddingVertical: 0,
  },
  searchResultsCard: {
    marginTop: 8,
    marginBottom: 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  searchResultIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultTextWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  searchResultTitle: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '700',
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  searchEmptyText: {
    fontSize: 12,
    color: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  greeting: { fontSize: 14, color: COLORS.lightBlue, marginTop: 4, lineHeight: 20 },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  heroCard: {
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  heroEyebrow: { color: COLORS.lightBlue, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle: { color: COLORS.white, fontSize: 22, fontWeight: '600', lineHeight: 30, marginTop: 8 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingTop: 18, paddingBottom: 30 },
  errorBanner: {
    backgroundColor: '#FFF4DB',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  errorText: { color: '#8A5A00', flex: 1, fontSize: 13, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  sectionHelper: { fontSize: 13, color: COLORS.gray, marginTop: 4, lineHeight: 19 },
  seeAll: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: { fontSize: 16, fontWeight: '700', color: COLORS.black, lineHeight: 22 },
  actionHelper: { fontSize: 12, color: COLORS.gray, marginTop: 4, lineHeight: 18 },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lightBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  seedBtn: { marginTop: 18, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  seedBtnText: { color: COLORS.white, fontWeight: '700' },
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
  tripTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  tripTitle: { fontSize: 19, fontWeight: '700', color: COLORS.black, marginTop: 12, lineHeight: 24 },
  tripMetaRow: { marginTop: 10, gap: 6 },
  tripMeta: { flexDirection: 'row', alignItems: 'center' },
  tripMetaText: { marginLeft: 6, fontSize: 13, color: COLORS.gray },
  tripSummaryRow: {
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
  tripSummaryBlock: { flex: 1 },
  tripSummaryLabel: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase' },
  tripSummaryValue: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginTop: 4 },
  helpSection: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  helpContent: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: { marginLeft: 12, flex: 1 },
  helpTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  helpSubtitle: { fontSize: 13, color: COLORS.lightBlue, marginTop: 4, lineHeight: 19 },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  helpBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
});
