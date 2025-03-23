# Tours Component

This component will handle the management and booking of guided tours and experiences in Sri Lanka.

## Features to Implement

1. Tour listing with category filters
2. Detailed tour view
3. Tour booking system
4. Tour guide profiles
5. Business owner dashboard
6. Review and rating system
7. Tour calendar and availability

## Component Structure

```
tours/
├── TourList.js            # Main listing component
├── TourDetail.js          # Single tour view
├── TourBooking.js         # Booking interface
├── GuideProfile.js        # Tour guide profiles
├── BusinessDashboard.js   # Tour operator interface
├── ReviewSystem.js        # Review component
└── styles/               # Component-specific styles
```

## API Integration Points

- GET `/api/tours` - List all tours
- GET `/api/tours/:id` - Get single tour
- POST `/api/tours` - Create new tour (Business)
- PUT `/api/tours/:id` - Update tour (Business)
- DELETE `/api/tours/:id` - Delete tour (Business)
- POST `/api/tours/booking` - Create booking
- GET `/api/tours/availability/:id` - Check availability
- GET `/api/tours/guides` - List tour guides

## Data Structure

```javascript
{
  name: String,
  description: String,
  operator: {
    userId: ObjectId,
    companyName: String,
    contactInfo: {
      phone: String,
      email: String
    }
  },
  duration: {
    days: Number,
    hours: Number
  },
  itinerary: [{
    day: Number,
    activities: [{
      time: String,
      description: String,
      location: String
    }]
  }],
  pricing: {
    adult: Number,
    child: Number,
    group: Number,
    private: Number
  },
  includes: [String],
  excludes: [String],
  meetingPoint: {
    location: String,
    coordinates: [Number]
  },
  guides: [{
    name: String,
    experience: Number,
    languages: [String],
    profile: String
  }],
  ratings: {
    average: Number,
    count: Number
  },
  reviews: [{
    user: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }],
  images: [String],
  categories: [String],
  difficulty: String,
  maxGroupSize: Number
}
```

## Implementation Guidelines

1. Use Material-UI components for consistent design
2. Implement responsive design for all screen sizes
3. Include proper error handling
4. Add loading states for async operations
5. Implement secure payment integration
6. Use Redux for state management
7. Include unit tests for components
8. Implement real-time availability updates
9. Add email notification system for bookings
10. Include map integration for tour routes 