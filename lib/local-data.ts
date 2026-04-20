import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  trips: "gta.trips",
  notifications: "gta.notifications",
  feedback: "gta.feedback",
  initialized: "gta.initialized",
} as const;

export interface Trip {
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
  created_at: string;
  coordinates: { lat: number; lng: number };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  trip_id: string | null;
  read: boolean;
  action_required: boolean;
  options: Array<{ id: string; name: string; price: number }>;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  type: string;
  subject: string;
  message: string;
  user_email: string;
  status: string;
  created_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.006 },
  London: { lat: 51.5074, lng: -0.1278 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
};

const INITIAL_TRIPS: Trip[] = [
  {
    id: "trip-1",
    title: "Q3 Sales Meeting",
    destination: "New York",
    start_date: "2026-07-15",
    end_date: "2026-07-18",
    purpose: "Quarterly sales review with East Coast team",
    status: "approved",
    budget: 3500,
    expenses: 1200,
    traveler_name: "John Smith",
    traveler_email: "john.smith@company.com",
    flights: [
      {
        airline: "Delta",
        flight: "DL1234",
        departure: "2026-07-15T08:00:00",
        arrival: "2026-07-15T11:30:00",
        from: "LAX",
        to: "JFK",
      },
      {
        airline: "Delta",
        flight: "DL5678",
        departure: "2026-07-18T18:00:00",
        arrival: "2026-07-18T21:30:00",
        from: "JFK",
        to: "LAX",
      },
    ],
    hotels: [
      {
        name: "Marriott Marquis",
        checkin: "2026-07-15",
        checkout: "2026-07-18",
        address: "1535 Broadway, New York",
      },
    ],
    meetings: [
      {
        title: "Sales Review",
        date: "2026-07-16",
        time: "09:00",
        location: "Conference Room A",
      },
    ],
    notes: "",
    created_at: "2026-04-01T10:00:00.000Z",
    coordinates: DESTINATION_COORDINATES["New York"],
  },
  {
    id: "trip-2",
    title: "Tech Conference",
    destination: "San Francisco",
    start_date: "2026-08-10",
    end_date: "2026-08-13",
    purpose: "Annual developer conference",
    status: "pending",
    budget: 4000,
    expenses: 0,
    traveler_name: "Jane Doe",
    traveler_email: "jane.doe@company.com",
    flights: [],
    hotels: [],
    meetings: [],
    notes: "",
    created_at: "2026-04-05T12:00:00.000Z",
    coordinates: DESTINATION_COORDINATES["San Francisco"],
  },
  {
    id: "trip-3",
    title: "Client Meeting - APAC",
    destination: "Tokyo",
    start_date: "2026-09-01",
    end_date: "2026-09-05",
    purpose: "Meet with key APAC clients",
    status: "approved",
    budget: 8000,
    expenses: 2500,
    traveler_name: "John Smith",
    traveler_email: "john.smith@company.com",
    flights: [
      {
        airline: "ANA",
        flight: "NH105",
        departure: "2026-09-01T10:00:00",
        arrival: "2026-09-02T14:00:00",
        from: "LAX",
        to: "NRT",
      },
    ],
    hotels: [
      {
        name: "Park Hyatt Tokyo",
        checkin: "2026-09-02",
        checkout: "2026-09-05",
        address: "3-7-1-2 Nishi Shinjuku",
      },
    ],
    meetings: [],
    notes: "",
    created_at: "2026-04-08T15:00:00.000Z",
    coordinates: DESTINATION_COORDINATES["Tokyo"],
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "allocation",
    title: "Flight Booked",
    message: "Your flight DL1234 to New York has been confirmed.",
    trip_id: "trip-1",
    read: false,
    action_required: false,
    options: [],
    created_at: "2026-04-10T09:15:00.000Z",
  },
  {
    id: "notif-2",
    type: "preference",
    title: "Set Your Preferences",
    message: "Please set your seating and meal preferences for your upcoming trip.",
    trip_id: "trip-1",
    read: false,
    action_required: true,
    options: [],
    created_at: "2026-04-11T14:30:00.000Z",
  },
  {
    id: "notif-3",
    type: "option",
    title: "Choose Your Hotel",
    message: "Select from available hotels for your San Francisco trip.",
    trip_id: "trip-2",
    read: false,
    action_required: true,
    options: [
      { id: "h1", name: "Marriott Union Square", price: 299 },
      { id: "h2", name: "Hilton Financial District", price: 279 },
      { id: "h3", name: "Hyatt Regency", price: 319 },
    ],
    created_at: "2026-04-12T11:45:00.000Z",
  },
];

const FAQS: FAQItem[] = [
  {
    id: "1",
    question: "How do I submit a travel request?",
    answer: "Navigate to the Trips tab and tap New Trip Request. Fill in the required details including destination, dates, and purpose.",
    category: "Requests",
    order: 1,
  },
  {
    id: "2",
    question: "What is the expense policy?",
    answer: "Business travel expenses should be pre-approved when possible. Keep your receipts and submit reimbursement promptly after the trip.",
    category: "Expenses",
    order: 2,
  },
  {
    id: "3",
    question: "How do I change my flight?",
    answer: "Open the support area and use chat or contact your travel coordinator. Flight changes may include carrier fees.",
    category: "Flights",
    order: 3,
  },
  {
    id: "4",
    question: "What hotels are approved?",
    answer: "This demo app uses example hotel options only. In a production app, approved hotel lists would come from your company policy system.",
    category: "Hotels",
    order: 4,
  },
  {
    id: "5",
    question: "How do I report a travel emergency?",
    answer: "Contact local emergency services first, then notify your travel coordinator or company emergency contact as soon as possible.",
    category: "Emergency",
    order: 5,
  },
];

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const REMOVED_TRIP_TITLES = new Set(["teadf"]);

function shouldRemoveTrip(trip: Trip) {
  return REMOVED_TRIP_TITLES.has(trip.title.trim().toLowerCase());
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function ensureInitialized() {
  const initialized = await AsyncStorage.getItem(STORAGE_KEYS.initialized);
  if (initialized) {
    return;
  }

  await writeJson(STORAGE_KEYS.trips, INITIAL_TRIPS);
  await writeJson(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
  await writeJson(STORAGE_KEYS.feedback, []);
  await AsyncStorage.setItem(STORAGE_KEYS.initialized, "true");
}

export async function resetDemoData() {
  await writeJson(STORAGE_KEYS.trips, INITIAL_TRIPS);
  await writeJson(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
  await writeJson(STORAGE_KEYS.feedback, []);
  await AsyncStorage.setItem(STORAGE_KEYS.initialized, "true");
}

export async function getTrips() {
  await ensureInitialized();
  const trips = await readJson<Trip[]>(STORAGE_KEYS.trips, INITIAL_TRIPS);
  const keptTrips = trips.filter((trip) => !shouldRemoveTrip(trip));

  if (keptTrips.length !== trips.length) {
    const removedTripIds = new Set(
      trips.filter((trip) => shouldRemoveTrip(trip)).map((trip) => trip.id)
    );
    const notifications = await readJson<NotificationItem[]>(
      STORAGE_KEYS.notifications,
      INITIAL_NOTIFICATIONS
    );
    const keptNotifications = notifications.filter(
      (notification) => !notification.trip_id || !removedTripIds.has(notification.trip_id)
    );

    await writeJson(STORAGE_KEYS.trips, keptTrips);

    if (keptNotifications.length !== notifications.length) {
      await writeJson(STORAGE_KEYS.notifications, keptNotifications);
    }
  }

  return [...keptTrips].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getTrip(id: string) {
  const trips = await getTrips();
  return trips.find((trip) => trip.id === id) ?? null;
}

export async function createTrip(
  input: Omit<Trip, "id" | "status" | "expenses" | "flights" | "hotels" | "meetings" | "created_at" | "coordinates">
) {
  const trips = await getTrips();
  const trip: Trip = {
    ...input,
    id: generateId("trip"),
    status: "pending",
    expenses: 0,
    flights: [],
    hotels: [],
    meetings: [],
    created_at: new Date().toISOString(),
    coordinates: DESTINATION_COORDINATES[input.destination] ?? { lat: 0, lng: 0 },
  };

  const nextTrips = [trip, ...trips];
  await writeJson(STORAGE_KEYS.trips, nextTrips);

  const notifications = await getNotifications();
  const submissionNotification: NotificationItem = {
    id: generateId("notif"),
    type: "allocation",
    title: "New Trip Request Submitted",
    message: `Your trip to ${trip.destination} has been saved on this device.`,
    trip_id: trip.id,
    read: false,
    action_required: false,
    options: [],
    created_at: new Date().toISOString(),
  };
  await writeJson(STORAGE_KEYS.notifications, [submissionNotification, ...notifications]);

  return trip;
}

export async function getNotifications() {
  await ensureInitialized();
  return readJson<NotificationItem[]>(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
}

export async function getUnreadNotificationCount() {
  const notifications = await getNotifications();
  return notifications.filter((notification) => !notification.read).length;
}

export async function markNotificationRead(id: string) {
  const notifications = await getNotifications();
  const nextNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );
  await writeJson(STORAGE_KEYS.notifications, nextNotifications);
}

export async function submitFeedback(input: Omit<FeedbackItem, "id" | "status" | "created_at">) {
  await ensureInitialized();
  const feedback = await readJson<FeedbackItem[]>(STORAGE_KEYS.feedback, []);
  const item: FeedbackItem = {
    ...input,
    id: generateId("feedback"),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  await writeJson(STORAGE_KEYS.feedback, [item, ...feedback]);
  return item;
}

export async function getFaqs() {
  return [...FAQS].sort((a, b) => a.order - b.order);
}

export async function getChatReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("expense") || normalized.includes("reimbursement")) {
    return "For now this standalone Expo build uses demo policy guidance: keep receipts, stay within budget, and submit reimbursement soon after travel.";
  }

  if (normalized.includes("flight") || normalized.includes("book")) {
    return "In this local demo, booking is simulated. You can create a trip request and treat support chat as the place where booking help will later connect to a real backend.";
  }

  if (normalized.includes("hotel")) {
    return "Hotel selection is running in demo mode. The notifications screen includes example hotel options for one of the seeded trips.";
  }

  if (normalized.includes("emergency") || normalized.includes("help")) {
    return "For emergencies, contact local emergency services first, then your company travel contact. We can wire real escalation flows into the app later.";
  }

  return "This app is running as a local Expo demo right now, so chat is using canned responses. We can connect a real AI backend later when you're ready.";
}
