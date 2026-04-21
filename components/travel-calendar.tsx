import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CalendarEvent,
  formatAgendaDate,
  getCalendarSubtitle,
  getDateKey,
  getMonthLabel,
  getMonthRange,
} from '../lib/calendar-data';

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
};

const INDICATOR_COLORS: Record<CalendarEvent['type'], string> = {
  trip: '#7EA8FF',
  flight: '#56BBFF',
  hotel: '#2A92B8',
  meeting: '#83D7F0',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TravelCalendarProps {
  events: CalendarEvent[];
  emptyTitle: string;
  emptySubtitle: string;
}

export function TravelCalendar({ events, emptyTitle, emptySubtitle }: TravelCalendarProps) {
  const router = useRouter();
  const initialMonth = events.length ? new Date(events[0].date) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(events[0]?.date ?? getDateKey(new Date()));

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [events]);

  const monthDays = useMemo(() => getMonthRange(currentMonth), [currentMonth]);
  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const goMonth = (direction: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.monthLabel}>{getMonthLabel(currentMonth)}</Text>
          <Text style={styles.monthHelper}>{getCalendarSubtitle(events)}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => goMonth(-1)}>
            <Ionicons name="chevron-back" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => goMonth(1)}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthDays.map((date) => {
          const dateKey = getDateKey(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isSelected = dateKey === selectedDate;
          const dayEvents = eventsByDate[dateKey] ?? [];

          return (
            <TouchableOpacity
              key={dateKey}
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              onPress={() => setSelectedDate(dateKey)}
            >
              <Text style={[styles.dayText, !isCurrentMonth && styles.dayTextMuted, isSelected && styles.dayTextSelected]}>
                {date.getDate()}
              </Text>
              <View style={styles.dotRow}>
                {dayEvents.slice(0, 3).map((event) => (
                  <View key={event.id} style={[styles.dot, { backgroundColor: INDICATOR_COLORS[event.type] }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.agendaCard}>
        <Text style={styles.agendaTitle}>{formatAgendaDate(selectedDate)}</Text>
        {selectedEvents.length ? (
          selectedEvents.map((event) => (
            <View key={event.id} style={styles.agendaItem}>
              <View style={[styles.agendaAccent, { backgroundColor: event.color }]} />
              <View style={styles.agendaContent}>
                <Text style={styles.agendaItemTitle}>{event.title}</Text>
                <Text style={styles.agendaItemSubtitle}>{event.subtitle}</Text>
                <TouchableOpacity onPress={() => router.push(`/trips/${event.tripId}`)} activeOpacity={0.8}>
                  <Text style={styles.agendaItemMeta}>{event.tripTitle}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={28} color={COLORS.lightBlue} />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,51,160,0.06)',
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
  },
  monthHelper: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 2,
  },
  dayCell: {
    width: '13.4%',
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  dayTextMuted: {
    color: '#A3AAB7',
  },
  dayTextSelected: {
    color: COLORS.white,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    minHeight: 8,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  agendaCard: {
    marginTop: 18,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 16,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  agendaAccent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  agendaContent: {
    flex: 1,
    marginLeft: 10,
  },
  agendaItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  agendaItemSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
    lineHeight: 18,
  },
  agendaItemMeta: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});
