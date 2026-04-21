import type { Trip } from './local-data';

export type CalendarEventType = 'trip' | 'flight' | 'hotel' | 'meeting';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  type: CalendarEventType;
  tripId: string;
  tripTitle: string;
  color: string;
}

const EVENT_COLORS: Record<CalendarEventType, string> = {
  trip: '#0033A0',
  flight: '#2D67FF',
  hotel: '#328DFF',
  meeting: '#00A86B',
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseCalendarDate = (value: string) => {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
};

const toIsoDate = (value: string) => {
  const date = parseCalendarDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatShort = (value: string) =>
  parseCalendarDate(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const formatTime = (value: string) =>
  parseCalendarDate(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const formatMeetingSubtitle = (meeting: Trip['meetings'][number]) => {
  const schedule = meeting.all_day
    ? 'All day'
    : meeting.start_time && meeting.end_time
    ? `${meeting.start_time} - ${meeting.end_time}`
    : meeting.start_time ?? meeting.time ?? '';

  if (schedule && meeting.location) {
    return `${schedule} at ${meeting.location}`;
  }

  return schedule || meeting.location || 'Trip event';
};

const toDateOnly = (value: string) => toIsoDate(value);

const enumerateDates = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const cursor = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);

  while (cursor <= end) {
    dates.push(toIsoDate(cursor.toISOString()));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export function buildTripCalendarEvents(trip: Trip): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const sortedFlights = [...trip.flights].sort((a, b) => a.departure.localeCompare(b.departure));
  const outboundFlight = sortedFlights[0];
  const returnFlight = sortedFlights.length > 1 ? sortedFlights[sortedFlights.length - 1] : null;

  enumerateDates(trip.start_date, trip.end_date).forEach((date, index) => {
    const startsWithFlight =
      outboundFlight && toDateOnly(outboundFlight.departure) === date
        ? `Outbound flight ${outboundFlight.from} to ${outboundFlight.to} at ${formatTime(outboundFlight.departure)}`
        : null;
    const endsWithFlight =
      returnFlight && toDateOnly(returnFlight.departure) === date
        ? `Return flight ${returnFlight.from} to ${returnFlight.to} at ${formatTime(returnFlight.departure)}`
        : null;

    events.push({
      id: `${trip.id}-trip-${date}`,
      date,
      title: trip.title,
      subtitle:
        index === 0
          ? startsWithFlight ?? `Trip starts in ${trip.destination}`
          : date === toIsoDate(trip.end_date)
          ? endsWithFlight ?? `Trip ends in ${trip.destination}`
          : `Trip active in ${trip.destination}`,
      type: 'trip',
      tripId: trip.id,
      tripTitle: trip.title,
      color: EVENT_COLORS.trip,
    });
  });

  trip.flights.forEach((flight, index) => {
    events.push({
      id: `${trip.id}-flight-depart-${index}`,
      date: toIsoDate(flight.departure),
      title: `${flight.airline} ${flight.flight}`,
      subtitle: `${formatTime(flight.departure)} departure from ${flight.from} to ${flight.to}`,
      type: 'flight',
      tripId: trip.id,
      tripTitle: trip.title,
      color: EVENT_COLORS.flight,
    });
  });

  trip.hotels.forEach((hotel, index) => {
    events.push({
      id: `${trip.id}-hotel-checkin-${index}`,
      date: toIsoDate(hotel.checkin),
      title: hotel.name,
      subtitle: `Check-in at ${hotel.name}`,
      type: 'hotel',
      tripId: trip.id,
      tripTitle: trip.title,
      color: EVENT_COLORS.hotel,
    });
    events.push({
      id: `${trip.id}-hotel-checkout-${index}`,
      date: toIsoDate(hotel.checkout),
      title: hotel.name,
      subtitle: `Check-out from ${hotel.name}`,
      type: 'hotel',
      tripId: trip.id,
      tripTitle: trip.title,
      color: EVENT_COLORS.hotel,
    });
  });

  trip.meetings.forEach((meeting, index) => {
    events.push({
      id: `${trip.id}-meeting-${index}`,
      date: toIsoDate(meeting.date),
      title: meeting.title,
      subtitle: formatMeetingSubtitle(meeting),
      type: 'meeting',
      tripId: trip.id,
      tripTitle: trip.title,
      color: EVENT_COLORS.meeting,
    });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function buildAllCalendarEvents(trips: Trip[]) {
  return trips.flatMap((trip) => buildTripCalendarEvents(trip));
}

export function formatAgendaDate(date: string) {
  return parseCalendarDate(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthRange(baseDate: Date) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const last = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function getCalendarSubtitle(events: CalendarEvent[]) {
  if (!events.length) return 'No scheduled activity';

  const first = events[0].date;
  const last = events[events.length - 1].date;
  return `${formatShort(first)} to ${formatShort(last)}`;
}
