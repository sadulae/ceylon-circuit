# Accommodations Component

This component will handle the management and booking of accommodations across Sri Lanka.

## Features to Implement

1. Accommodation listing with advanced filters
2. Detailed property view
3. Booking system integration
4. Price comparison
5. Business owner dashboard
6. Review and rating system
7. Availability calendar

## Component Structure

```
accommodations/
├── AccommodationList.js     # Main listing component
├── AccommodationDetail.js   # Single property view
├── BookingForm.js          # Booking interface
├── PriceComparison.js      # Price comparison tool
├── BusinessDashboard.js    # Property owner interface
├── ReviewSystem.js         # Review component
└── styles/                 # Component-specific styles
```

## API Integration Points

- GET `/api/accommodations` - List all accommodations
- GET `/api/accommodations/:id` - Get single accommodation
- POST `/api/accommodations` - Create new listing (Business)
- PUT `/api/accommodations/:id` - Update listing (Business)
- DELETE `/api/accommodations/:id` - Delete listing (Business)
- POST `/api/accommodations/booking` - Create booking
- GET `/api/accommodations/availability/:id` - Check availability

## Data Structure

```javascript
{
  name: String,
  description: String,
  location: {
    coordinates: [Number],
    address: String,
    city: String,
    region: String
  },
  owner: {
    userId: ObjectId,
    contactInfo: {
      phone: String,
      email: String
    }
  },
  amenities: [String],
  rooms: [{
    type: String,
    capacity: Number,
    price: Number,
    features: [String],
    images: [String]
  }],
  policies: {
    checkIn: String,
    checkOut: String,
    cancellation: String
  },
  ratings: {
    average: Number,
    count: Number
  },
  reviews: [{
    user: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }]
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