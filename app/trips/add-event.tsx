import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addTripMeeting, getTrips, Trip } from '../../lib/local-data';

const COLORS = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFC',
  border: '#D9E2EC',
  text: '#111827',
  textMuted: '#6B7280',
  accent: '#0033A0',
  darkBlue: '#000063',
  lightBlue: '#328DFF',
  chipActive: '#0033A0',
  white: '#FFFFFF',
};

const REMINDER_OPTIONS = ['No notification', '10 minutes before', '2 hours before', 'Custom time'];
const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Monthly'];
const DETAIL_OPTION_ORDER = ['repeat', 'location', 'url', 'notes', 'todo', 'files'] as const;
type DetailOptionKey = (typeof DETAIL_OPTION_ORDER)[number];

const DETAIL_OPTION_META: Record<
  DetailOptionKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  repeat: { label: 'Repeat', icon: 'repeat-outline' },
  location: { label: 'Location', icon: 'location-outline' },
  url: { label: 'URL', icon: 'link-outline' },
  notes: { label: 'Note', icon: 'document-text-outline' },
  todo: { label: 'To-Do List', icon: 'checkmark-done-outline' },
  files: { label: 'Files', icon: 'attach-outline' },
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string) {
  if (!value) return '';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function to24HourTime(value: string) {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem === 'AM') {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export default function AddTripEventScreen() {
  const router = useRouter();
  const { tripId, tripTitle } = useLocalSearchParams<{ tripId?: string; tripTitle?: string }>();
  const defaultDate = useMemo(() => getTodayDate(), []);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId ? String(tripId) : '');
  const [showTripOptions, setShowTripOptions] = useState(false);
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('10:00 PM');
  const [endDate, setEndDate] = useState(defaultDate);
  const [endTime, setEndTime] = useState('11:00 PM');
  const [reminder, setReminder] = useState(REMINDER_OPTIONS[0]);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [activeDetailOptions, setActiveDetailOptions] = useState<DetailOptionKey[]>([]);
  const [repeat, setRepeat] = useState(REPEAT_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [todoList, setTodoList] = useState('');
  const [attachments, setAttachments] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
  const connectedTripTitle = tripId
    ? tripTitle || 'Trip event'
    : selectedTrip?.title || 'Trip event';

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (err) {
        console.error('Error loading trips for event creation:', err);
      }
    };
    fetchTrips();
  }, []);

  const closeOverlayMenus = () => {
    setShowReminderOptions(false);
    setShowRepeatOptions(false);
    setShowTripOptions(false);
  };

  const toggleTripOptions = () => {
    setShowTripOptions((current) => {
      const next = !current;
      if (next) {
        setShowReminderOptions(false);
        setShowRepeatOptions(false);
      }
      return next;
    });
  };

  const toggleReminderOptions = () => {
    setShowReminderOptions((current) => {
      const next = !current;
      if (next) {
        setShowRepeatOptions(false);
        setShowTripOptions(false);
      }
      return next;
    });
  };

  const toggleRepeatOptions = () => {
    setShowRepeatOptions((current) => {
      const next = !current;
      if (next) {
        setShowReminderOptions(false);
        setShowTripOptions(false);
      }
      return next;
    });
  };

  const availableDetailOptions = DETAIL_OPTION_ORDER.filter(
    (option) => !activeDetailOptions.includes(option)
  );

  const addDetailOption = (option: DetailOptionKey) => {
    closeOverlayMenus();
    setActiveDetailOptions((current) => [...current, option]);
  };

  const handleSave = async () => {
    const resolvedTripId = tripId ? String(tripId) : selectedTripId;

    if (!resolvedTripId) {
      Alert.alert('Missing trip', 'Select a trip to attach this event.');
      return;
    }

    if (!title.trim() || !startDate.trim() || (!allDay && !endDate.trim())) {
      Alert.alert(
        'Missing details',
        allDay
          ? 'Please fill in the title and start date.'
          : 'Please fill in the title, start date, and end date.'
      );
      return;
    }

    if (!allDay && (!startTime.trim() || !endTime.trim())) {
      Alert.alert('Missing time', 'Please fill in both the start time and end time.');
      return;
    }

    const normalizedStartTime = allDay ? null : to24HourTime(startTime);
    const normalizedEndTime = allDay ? null : to24HourTime(endTime);

    if (!allDay && (!normalizedStartTime || !normalizedEndTime)) {
      Alert.alert('Invalid time', 'Use a 12-hour time like 10:00 PM.');
      return;
    }

    setSaving(true);

    try {
      await addTripMeeting(resolvedTripId, {
        title: title.trim(),
        date: startDate.trim(),
        end_date: allDay ? startDate.trim() : endDate.trim(),
        time: allDay ? 'All day' : normalizedStartTime ?? undefined,
        start_time: allDay ? undefined : normalizedStartTime ?? undefined,
        end_time: allDay ? undefined : normalizedEndTime ?? undefined,
        all_day: allDay,
        location: location.trim(),
        reminder_enabled: reminder !== 'No notification',
        reminder,
        repeat,
        attachments: attachments
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        notes: notes.trim(),
        url: url.trim(),
        todo_list: todoList
          .split('\n')
          .map((item) => item.replace(/^[-*]\s*/, '').trim())
          .filter(Boolean),
      });
      router.back();
    } catch (err) {
      console.error('Error adding trip event:', err);
      Alert.alert('Unable to save', 'Please try adding the event again.');
    } finally {
      setSaving(false);
    }
  };

  const renderDetailPanel = (option: DetailOptionKey) => {
    const meta = DETAIL_OPTION_META[option];

    if (option === 'repeat') {
      return (
        <View
          key={option}
          style={[
            styles.rowCard,
            styles.detailCard,
            styles.rowCardOverlay,
            showRepeatOptions && styles.rowCardOverlayActive,
          ]}
        >
          <TouchableOpacity
            style={styles.inlineRow}
            onPress={toggleRepeatOptions}
            activeOpacity={0.9}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={meta.icon} size={22} color={COLORS.accent} />
              <Text style={styles.rowText}>{repeat}</Text>
            </View>
            <Ionicons
              name={showRepeatOptions ? 'chevron-up' : 'chevron-forward'}
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
          {showRepeatOptions && (
            <View style={styles.dropdownOverlay}>
              {REPEAT_OPTIONS.map((value, index) => {
                const selected = value === repeat;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.dropdownItem, index > 0 && styles.dropdownDivider]}
                    onPress={() => {
                      setRepeat(value);
                      setShowRepeatOptions(false);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.dropdownText, selected && styles.dropdownTextSelected]}>{value}</Text>
                    {selected && <Ionicons name="checkmark" size={18} color={COLORS.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    }
    const value =
      option === 'location'
        ? location
        : option === 'url'
        ? url
        : option === 'notes'
        ? notes
        : option === 'todo'
        ? todoList
        : attachments;
    const setValue =
      option === 'location'
        ? setLocation
        : option === 'url'
        ? setUrl
        : option === 'notes'
        ? setNotes
        : option === 'todo'
        ? setTodoList
        : setAttachments;
    const placeholder =
      option === 'location'
        ? 'Add location'
        : option === 'url'
        ? 'https://'
        : option === 'notes'
        ? 'Add note'
        : option === 'todo'
        ? 'Add to-do list'
        : 'Add file';

    return (
      <View key={option} style={[styles.rowCard, styles.detailCard]}>
        <View style={styles.inlineRow}>
          <View style={styles.rowLeft}>
            <Ionicons name={meta.icon} size={22} color={COLORS.accent} />
            <TextInput
              style={styles.detailInlineInput}
              value={value}
              onChangeText={setValue}
              onFocus={closeOverlayMenus}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New Event</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
                <Text style={styles.saveText}>{saving ? 'Saving' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.rowCard, styles.titleCard]}>
            <View style={styles.titleBlock}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor="#A4B2C0"
              />
              <Text style={styles.tripSubtitle} numberOfLines={1}>
                {connectedTripTitle}
              </Text>
            </View>
          </View>

          {!tripId && (
            <View
              style={[
                styles.rowCard,
                styles.rowCardOverlay,
                showTripOptions && styles.rowCardOverlayActive,
              ]}
            >
              <TouchableOpacity
                style={styles.inlineRow}
                onPress={toggleTripOptions}
                activeOpacity={0.9}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="briefcase-outline" size={22} color={COLORS.accent} />
                  <Text style={styles.rowText}>{selectedTrip?.title || 'Select trip'}</Text>
                </View>
                <Ionicons
                  name={showTripOptions ? 'chevron-up' : 'chevron-forward'}
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>

              {showTripOptions && (
                <View style={styles.dropdownOverlay}>
                  {trips.map((trip, index) => (
                    <TouchableOpacity
                      key={trip.id}
                      style={[styles.dropdownItem, index > 0 && styles.dropdownDivider]}
                      onPress={() => {
                        setSelectedTripId(trip.id);
                        setShowTripOptions(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          trip.id === selectedTripId && styles.dropdownTextSelected,
                        ]}
                      >
                        {trip.title}
                      </Text>
                      {trip.id === selectedTripId && (
                        <Ionicons name="checkmark" size={18} color={COLORS.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.rowCard}>
            <View style={styles.inlineRow}>
              <View style={styles.rowLeft}>
                <Ionicons name="time-outline" size={22} color={COLORS.accent} />
                <Text style={styles.rowText}>All-day</Text>
              </View>
              <Switch
                value={allDay}
                onValueChange={(value) => {
                  closeOverlayMenus();
                  setAllDay(value);
                }}
                trackColor={{ false: '#4B4B4B', true: '#2B8F99' }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.dateTimeBlock}>
              <View style={styles.dateTimeIconWrap}>
                <Ionicons name="arrow-forward-outline" size={24} color={COLORS.accent} />
              </View>
              <View style={styles.dateTimeTextWrap}>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  onFocus={closeOverlayMenus}
                  placeholder="2026-04-20"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />
                <Text style={styles.helperText}>{formatDateDisplay(startDate)}</Text>
              </View>
              {!allDay && (
                <TextInput
                  style={styles.timeInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  onFocus={closeOverlayMenus}
                  placeholder="10:00 PM"
                  placeholderTextColor={COLORS.text}
                  autoCapitalize="none"
                />
              )}
            </View>

            {!allDay && (
              <View style={styles.dateTimeBlock}>
                <View style={styles.dateTimeIconWrap}>
                  <Ionicons name="arrow-back-outline" size={24} color={COLORS.accent} />
                </View>
                <View style={styles.dateTimeTextWrap}>
                  <TextInput
                    style={styles.dateInput}
                    value={endDate}
                    onChangeText={setEndDate}
                    onFocus={closeOverlayMenus}
                    placeholder="2026-04-20"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                  <Text style={styles.helperText}>{formatDateDisplay(endDate)}</Text>
                </View>
                <TextInput
                  style={styles.timeInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  onFocus={closeOverlayMenus}
                  placeholder="11:00 PM"
                  placeholderTextColor={COLORS.text}
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>

          <View
            style={[
              styles.rowCard,
              styles.rowCardOverlay,
              showReminderOptions && styles.rowCardOverlayActive,
            ]}
          >
            <TouchableOpacity
              style={styles.inlineRow}
              onPress={toggleReminderOptions}
              activeOpacity={0.9}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="alarm-outline" size={22} color={COLORS.accent} />
                <Text style={styles.rowText}>{reminder}</Text>
              </View>
              <Ionicons
                name={showReminderOptions ? 'chevron-up' : 'chevron-forward'}
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>

            {showReminderOptions && (
              <View style={styles.dropdownOverlay}>
                {REMINDER_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.dropdownItem, index > 0 && styles.dropdownDivider]}
                    onPress={() => {
                      setReminder(option);
                      setShowReminderOptions(false);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        option === reminder && styles.dropdownTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {option === reminder && (
                      <Ionicons name="checkmark" size={18} color={COLORS.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {activeDetailOptions.map((option) => renderDetailPanel(option))}

          <View style={styles.chipSection}>
            <Text style={styles.plusText}>+</Text>
            <View style={styles.chipGrid}>
              {availableDetailOptions.map((option) => {
                const meta = DETAIL_OPTION_META[option];
                return (
                  <TouchableOpacity
                    key={option}
                    style={styles.actionChip}
                    onPress={() => addDetailOption(option)}
                    activeOpacity={0.9}
                  >
                    <Ionicons name={meta.icon} size={20} color={COLORS.accent} />
                    <Text style={styles.actionChipText}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingBottom: 40 },
  headerContainer: {
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 22,
    marginBottom: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  saveButton: {
    minWidth: 64,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  saveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  titleCard: {
    marginBottom: 16,
  },
  titleBlock: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  titleInput: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 0,
  },
  tripSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  rowCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  rowCardOverlay: {
    overflow: 'visible',
    zIndex: 30,
    elevation: 30,
  },
  rowCardOverlayActive: {
    zIndex: 80,
    elevation: 80,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  rowText: {
    fontSize: 18,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 22,
  },
  dateTimeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  dateTimeIconWrap: {
    width: 34,
    alignItems: 'flex-start',
  },
  dateTimeTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  dateInput: {
    fontSize: 18,
    color: COLORS.text,
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  timeInput: {
    width: 100,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'right',
    paddingVertical: 0,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 74,
    left: 12,
    right: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    zIndex: 50,
    elevation: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  dropdownItem: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownDivider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  chipSection: {
    paddingHorizontal: 22,
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  plusText: {
    color: COLORS.accent,
    fontSize: 30,
    lineHeight: 38,
    marginRight: 16,
  },
  chipGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionChip: {
    backgroundColor: '#E8EEF8',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionChipText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  detailCard: {
    marginBottom: 16,
  },
  detailInlineInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 0,
  },
});
