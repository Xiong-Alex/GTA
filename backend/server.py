from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class Trip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    destination: str
    start_date: str
    end_date: str
    purpose: str
    status: str = "pending"  # pending, approved, in_progress, completed
    budget: float = 0
    expenses: float = 0
    traveler_name: str
    traveler_email: str
    flights: List[dict] = []
    hotels: List[dict] = []
    meetings: List[dict] = []
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    coordinates: dict = Field(default_factory=lambda: {"lat": 0, "lng": 0})

class TripCreate(BaseModel):
    title: str
    destination: str
    start_date: str
    end_date: str
    purpose: str
    budget: float = 0
    traveler_name: str
    traveler_email: str
    notes: str = ""

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # allocation, preference, complication, option
    title: str
    message: str
    trip_id: Optional[str] = None
    read: bool = False
    action_required: bool = False
    options: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # complaint, suggestion, praise
    subject: str
    message: str
    user_email: str
    status: str = "pending"  # pending, reviewed, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FeedbackCreate(BaseModel):
    type: str
    subject: str
    message: str
    user_email: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: str
    message: str

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str
    order: int = 0

class TranslationRequest(BaseModel):
    text: str
    target_language: str

# ==================== MOCK DATA ====================

MOCK_DESTINATIONS = {
    "New York": {"lat": 40.7128, "lng": -74.0060},
    "London": {"lat": 51.5074, "lng": -0.1278},
    "Tokyo": {"lat": 35.6762, "lng": 139.6503},
    "Paris": {"lat": 48.8566, "lng": 2.3522},
    "Sydney": {"lat": -33.8688, "lng": 151.2093},
    "Dubai": {"lat": 25.2048, "lng": 55.2708},
    "Singapore": {"lat": 1.3521, "lng": 103.8198},
    "San Francisco": {"lat": 37.7749, "lng": -122.4194},
}

MOCK_FAQS = [
    {"id": "1", "question": "How do I submit a travel request?", "answer": "Navigate to the Trips tab and tap 'New Trip Request'. Fill in the required details including destination, dates, and purpose. Your request will be reviewed by your manager.", "category": "Requests", "order": 1},
    {"id": "2", "question": "What is the expense policy?", "answer": "All business travel expenses must be pre-approved. Daily meal allowances vary by destination. Keep all receipts for reimbursement. Expenses must be submitted within 30 days of trip completion.", "category": "Expenses", "order": 2},
    {"id": "3", "question": "How do I change my flight?", "answer": "Contact your travel coordinator or use the chat support. Flight changes may incur fees depending on the fare class. Changes must be requested at least 24 hours before departure.", "category": "Flights", "order": 3},
    {"id": "4", "question": "What hotels are approved?", "answer": "We have corporate rates with major hotel chains including Marriott, Hilton, and IHG. Check the approved hotel list in your company travel policy. Exceptions require manager approval.", "category": "Hotels", "order": 4},
    {"id": "5", "question": "How do I report a travel emergency?", "answer": "Call our 24/7 emergency hotline at 1-800-TRAVEL-HELP. For medical emergencies, contact local emergency services first, then notify us. Your safety is our priority.", "category": "Emergency", "order": 5},
]

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Global Travel App API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# ----- TRIPS -----

@api_router.get("/trips", response_model=List[Trip])
async def get_trips():
    trips = await db.trips.find().sort("created_at", -1).to_list(100)
    return [Trip(**trip) for trip in trips]

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return Trip(**trip)

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate):
    # Get coordinates for destination
    coords = MOCK_DESTINATIONS.get(trip_data.destination, {"lat": 0, "lng": 0})
    
    trip = Trip(
        **trip_data.dict(),
        coordinates=coords
    )
    await db.trips.insert_one(trip.dict())
    
    # Create notification for new trip
    notification = Notification(
        type="allocation",
        title="New Trip Request Submitted",
        message=f"Your trip to {trip_data.destination} has been submitted for approval.",
        trip_id=trip.id,
        action_required=False
    )
    await db.notifications.insert_one(notification.dict())
    
    return trip

@api_router.put("/trips/{trip_id}/status")
async def update_trip_status(trip_id: str, status: str):
    result = await db.trips.update_one(
        {"id": trip_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Status updated", "status": status}

# ----- NOTIFICATIONS -----

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications():
    notifications = await db.notifications.find().sort("created_at", -1).to_list(50)
    return [Notification(**n) for n in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.get("/notifications/unread-count")
async def get_unread_count():
    count = await db.notifications.count_documents({"read": False})
    return {"count": count}

# ----- FEEDBACK -----

@api_router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback_data: FeedbackCreate):
    feedback = Feedback(**feedback_data.dict())
    await db.feedback.insert_one(feedback.dict())
    return feedback

@api_router.get("/feedback", response_model=List[Feedback])
async def get_feedback():
    feedback_list = await db.feedback.find().sort("created_at", -1).to_list(100)
    return [Feedback(**f) for f in feedback_list]

# ----- FAQ -----

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find().sort("order", 1).to_list(50)
    if not faqs:
        # Return mock FAQs if none in database
        return [FAQ(**faq) for faq in MOCK_FAQS]
    return [FAQ(**faq) for faq in faqs]

# ----- CHAT (AI) -----

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Get chat history for context
        history = await db.chat_messages.find(
            {"session_id": request.session_id}
        ).sort("created_at", 1).to_list(20)
        
        # Build context from history
        context_messages = ""
        for msg in history[-10:]:  # Last 10 messages
            role = "User" if msg["role"] == "user" else "Assistant"
            context_messages += f"{role}: {msg['content']}\n"
        
        # Save user message
        user_msg = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message
        )
        await db.chat_messages.insert_one(user_msg.dict())
        
        # Initialize chat with OpenAI GPT-5.2
        chat = LlmChat(
            api_key=api_key,
            session_id=request.session_id,
            system_message="""You are a helpful corporate travel assistant for a B2B travel management platform. 
You help employees with:
- Travel booking questions and policies
- Expense reporting and reimbursement
- Flight and hotel changes
- Travel safety and emergency procedures
- General travel tips and destination information

Be professional, concise, and helpful. If you don't know something specific to the company policy, suggest contacting the travel coordinator.

Previous conversation:
""" + context_messages
        ).with_model("openai", "gpt-5.2")
        
        # Send message
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save assistant message
        assistant_msg = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=response
        )
        await db.chat_messages.insert_one(assistant_msg.dict())
        
        return {"response": response, "session_id": request.session_id}
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find(
        {"session_id": session_id}
    ).sort("created_at", 1).to_list(100)
    return [{"role": m["role"], "content": m["content"], "created_at": str(m["created_at"])} for m in messages]

# ----- TRANSLATION (Mock) -----

TRANSLATIONS = {
    "es": {"Hello": "Hola", "Welcome": "Bienvenido", "Trips": "Viajes", "Support": "Soporte", "Profile": "Perfil"},
    "fr": {"Hello": "Bonjour", "Welcome": "Bienvenue", "Trips": "Voyages", "Support": "Soutien", "Profile": "Profil"},
    "de": {"Hello": "Hallo", "Welcome": "Willkommen", "Trips": "Reisen", "Support": "Unterstützung", "Profile": "Profil"},
    "ja": {"Hello": "こんにちは", "Welcome": "ようこそ", "Trips": "旅行", "Support": "サポート", "Profile": "プロフィール"},
    "zh": {"Hello": "你好", "Welcome": "欢迎", "Trips": "旅行", "Support": "支持", "Profile": "个人资料"},
}

@api_router.post("/translate")
async def translate_text(request: TranslationRequest):
    """Mock translation - returns basic translations for common words"""
    lang_dict = TRANSLATIONS.get(request.target_language, {})
    translated = lang_dict.get(request.text, request.text)
    return {"original": request.text, "translated": translated, "language": request.target_language}

# ----- SEED DATA -----

@api_router.post("/seed")
async def seed_data():
    """Seed initial data for demo purposes"""
    # Clear existing data
    await db.trips.delete_many({})
    await db.notifications.delete_many({})
    await db.faqs.delete_many({})
    
    # Seed trips
    trips = [
        Trip(
            id="trip-1",
            title="Q3 Sales Meeting",
            destination="New York",
            start_date="2025-07-15",
            end_date="2025-07-18",
            purpose="Quarterly sales review with East Coast team",
            status="approved",
            budget=3500,
            expenses=1200,
            traveler_name="John Smith",
            traveler_email="john.smith@company.com",
            coordinates=MOCK_DESTINATIONS["New York"],
            flights=[
                {"airline": "Delta", "flight": "DL1234", "departure": "2025-07-15T08:00:00", "arrival": "2025-07-15T11:30:00", "from": "LAX", "to": "JFK"},
                {"airline": "Delta", "flight": "DL5678", "departure": "2025-07-18T18:00:00", "arrival": "2025-07-18T21:30:00", "from": "JFK", "to": "LAX"}
            ],
            hotels=[{"name": "Marriott Marquis", "checkin": "2025-07-15", "checkout": "2025-07-18", "address": "1535 Broadway, New York"}],
            meetings=[{"title": "Sales Review", "date": "2025-07-16", "time": "09:00", "location": "Conference Room A"}]
        ),
        Trip(
            id="trip-2",
            title="Tech Conference",
            destination="San Francisco",
            start_date="2025-08-10",
            end_date="2025-08-13",
            purpose="Annual developer conference",
            status="pending",
            budget=4000,
            expenses=0,
            traveler_name="Jane Doe",
            traveler_email="jane.doe@company.com",
            coordinates=MOCK_DESTINATIONS["San Francisco"]
        ),
        Trip(
            id="trip-3",
            title="Client Meeting - APAC",
            destination="Tokyo",
            start_date="2025-09-01",
            end_date="2025-09-05",
            purpose="Meet with key APAC clients",
            status="approved",
            budget=8000,
            expenses=2500,
            traveler_name="John Smith",
            traveler_email="john.smith@company.com",
            coordinates=MOCK_DESTINATIONS["Tokyo"],
            flights=[
                {"airline": "ANA", "flight": "NH105", "departure": "2025-09-01T10:00:00", "arrival": "2025-09-02T14:00:00", "from": "LAX", "to": "NRT"}
            ],
            hotels=[{"name": "Park Hyatt Tokyo", "checkin": "2025-09-02", "checkout": "2025-09-05", "address": "3-7-1-2 Nishi Shinjuku"}]
        )
    ]
    
    for trip in trips:
        await db.trips.insert_one(trip.dict())
    
    # Seed notifications
    notifications = [
        Notification(
            id="notif-1",
            type="allocation",
            title="Flight Booked",
            message="Your flight DL1234 to New York has been confirmed.",
            trip_id="trip-1",
            read=False
        ),
        Notification(
            id="notif-2",
            type="preference",
            title="Set Your Preferences",
            message="Please set your seating and meal preferences for your upcoming trip.",
            trip_id="trip-1",
            action_required=True
        ),
        Notification(
            id="notif-3",
            type="option",
            title="Choose Your Hotel",
            message="Select from available hotels for your San Francisco trip.",
            trip_id="trip-2",
            action_required=True,
            options=[
                {"id": "h1", "name": "Marriott Union Square", "price": 299},
                {"id": "h2", "name": "Hilton Financial District", "price": 279},
                {"id": "h3", "name": "Hyatt Regency", "price": 319}
            ]
        )
    ]
    
    for notif in notifications:
        await db.notifications.insert_one(notif.dict())
    
    # Seed FAQs
    for faq in MOCK_FAQS:
        await db.faqs.insert_one(faq)
    
    return {"message": "Data seeded successfully", "trips": len(trips), "notifications": len(notifications), "faqs": len(MOCK_FAQS)}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
