class TripMemory {
  constructor() {
    this.isReturningTraveler = null;
    this.previouslyVisitedPlaces = [];
    this.duration = null;
    this.currentDay = null;
    this.dayPlans = new Map();  // Map<dayNumber, { destinations: [], accommodation: null }>
    this.travelGuide = null;
    this.stage = 'greeting';
    this.lastUpdated = Date.now();
    this.messageHistory = [];  // Array of { role: string, content: string }
  }

  addMessage(role, content) {
    try {
      // Validate message
      if (!role || !content) {
        console.error('Invalid message:', { role, content });
        return false;
      }

      // Normalize content if it's an object
      const normalizedContent = typeof content === 'object' ? 
        { ...content, timestamp: Date.now() } : 
        { content, timestamp: Date.now() };

      this.messageHistory.push({ role, content: normalizedContent });
      this.lastUpdated = Date.now();
      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  getMessageHistory() {
    return this.messageHistory.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'object' ? msg.content.content : msg.content
    }));
  }

  setReturningTraveler(isReturning) {
    this.isReturningTraveler = isReturning;
    this.stage = isReturning ? 'collecting_previous_visits' : 'collecting_duration';
    this.lastUpdated = Date.now();
  }

  addPreviouslyVisitedPlace(place) {
    if (!this.previouslyVisitedPlaces.includes(place)) {
      this.previouslyVisitedPlaces.push(place);
    }
    this.lastUpdated = Date.now();
  }

  setDuration(days) {
    this.duration = days;
    this.stage = 'collecting_day_details';
    this.currentDay = 1;
    this.lastUpdated = Date.now();
  }

  addDayDestination(day, destination) {
    if (!this.dayPlans.has(day)) {
      this.dayPlans.set(day, { destinations: [], accommodation: null });
    }
    this.dayPlans.get(day).destinations.push(destination);
    this.lastUpdated = Date.now();
  }

  setDayAccommodation(day, accommodation) {
    if (!this.dayPlans.has(day)) {
      this.dayPlans.set(day, { destinations: [], accommodation: null });
    }
    this.dayPlans.get(day).accommodation = accommodation;
    this.lastUpdated = Date.now();
  }

  moveToNextDay() {
    if (this.currentDay < this.duration) {
      this.currentDay++;
      this.lastUpdated = Date.now();
      return true;
    }
    return false;
  }

  isComplete() {
    return this.stage === 'completed' &&
           this.duration === this.dayPlans.size &&
           [...this.dayPlans.values()].every(plan => 
             plan.destinations.length > 0 && plan.accommodation !== null
           );
  }

  reset() {
    this.isReturningTraveler = null;
    this.previouslyVisitedPlaces = [];
    this.duration = null;
    this.currentDay = null;
    this.dayPlans.clear();
    this.travelGuide = null;
    this.stage = 'greeting';
    this.lastUpdated = Date.now();
    this.messageHistory = [];
  }

  toJSON() {
    return {
      isReturningTraveler: this.isReturningTraveler,
      previouslyVisitedPlaces: this.previouslyVisitedPlaces,
      duration: this.duration,
      currentDay: this.currentDay,
      dayPlans: Array.from(this.dayPlans.entries()),
      travelGuide: this.travelGuide,
      stage: this.stage,
      lastUpdated: this.lastUpdated,
      messageHistory: this.messageHistory
    };
  }

  static fromJSON(data) {
    const memory = new TripMemory();
    Object.assign(memory, {
      ...data,
      dayPlans: new Map(data.dayPlans || []),
      lastUpdated: data.lastUpdated || Date.now(),
      messageHistory: data.messageHistory || []
    });
    return memory;
  }
}

// Memory store for conversation context
const memoryStore = new Map();

export const createMemory = (sessionId) => {
  const memory = new TripMemory();
  memoryStore.set(sessionId, memory);
  return memory;
};

export const getMemory = (sessionId) => {
  return memoryStore.get(sessionId);
};

export const updateMemory = (sessionId, memory) => {
  if (!(memory instanceof TripMemory)) {
    memory = TripMemory.fromJSON(memory);
  }
  memoryStore.set(sessionId, memory);
  return memory;
};

export const deleteMemory = (sessionId) => {
  memoryStore.delete(sessionId);
};

// Clean up old sessions (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  memoryStore.forEach((memory, sessionId) => {
    if (now - memory.lastUpdated > 24 * 60 * 60 * 1000) {
      memoryStore.delete(sessionId);
    }
  });
}, 60 * 60 * 1000);

export { TripMemory }; 