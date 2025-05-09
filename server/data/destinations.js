import mongoose from 'mongoose';
import Destination from '../models/Destination.js';

const destinations = [
  {
    name: 'Sigiriya',
    category: 'Historical',
    summary: 'Ancient rock fortress with panoramic views',
    description: 'Sigiriya is an ancient palace and fortress complex located in the northern Matale District. The site is dominated by a massive column of rock approximately 180 meters high. The name refers to a site of historical and archaeological significance that is dominated by a massive column of rock nearly 200 meters high.',
    location: {
      province: 'Central',
      district: 'Matale',
      address: 'Sigiriya, Central Province, Sri Lanka'
    },
    coordinates: {
      latitude: 7.9570,
      longitude: 80.7603
    },
    tags: ['UNESCO World Heritage', 'Ancient Ruins', 'Historical', 'Cultural'],
    facilities: ['Parking', 'Restrooms', 'Museum', 'Guide Service'],
    mainImage: '/uploads/sigiriya.jpg',
    images: [
      '/uploads/sigiriya-1.jpg',
      '/uploads/sigiriya-2.jpg'
    ],
    visitorTips: [
      'Visit early morning to avoid crowds and heat',
      'Wear comfortable walking shoes',
      'Bring plenty of water',
      'Allow 3-4 hours for the complete tour'
    ],
    bestTimeToVisit: 'December to April during the dry season',
    entryFee: 'Local: LKR 50, Foreign: USD 30',
    contactInfo: '+94 66 286 8831'
  },
  {
    name: 'Kandy',
    category: 'Cultural',
    summary: 'Sacred city and cultural capital of Sri Lanka',
    description: 'Kandy is a major city in Sri Lanka located in the Central Province. It was the last capital of the ancient kings\' era of Sri Lanka. The city lies in the midst of hills in the Kandy plateau, which crosses an area of tropical plantations, mainly tea. Kandy is both an administrative and religious city and is also the capital of the Central Province.',
    location: {
      province: 'Central',
      district: 'Kandy',
      address: 'Kandy, Central Province, Sri Lanka'
    },
    coordinates: {
      latitude: 7.2906,
      longitude: 80.6337
    },
    tags: ['UNESCO World Heritage', 'Cultural', 'Religious', 'Historical'],
    facilities: ['Parking', 'Restrooms', 'Shopping', 'Restaurants'],
    mainImage: '/uploads/kandy.jpg',
    images: [
      '/uploads/kandy-1.jpg',
      '/uploads/kandy-2.jpg'
    ],
    visitorTips: [
      'Visit the Temple of the Tooth',
      'Explore the Royal Botanical Gardens',
      'Watch a cultural dance performance',
      'Take a stroll around Kandy Lake'
    ],
    bestTimeToVisit: 'January to April',
    entryFee: 'Temple entry: USD 10',
    contactInfo: '+94 81 222 2661'
  },
  {
    name: 'Mirissa',
    category: 'Beach',
    summary: 'Stunning beach destination with whale watching',
    description: 'Mirissa is a small town on the south coast of Sri Lanka, located in the Matara District of the Southern Province. It is approximately 150 kilometers south of Colombo and is situated at an elevation of 4 meters above the sea level. The beach and nightlife of Mirissa make it an attractive holiday destination.',
    location: {
      province: 'Southern',
      district: 'Matara',
      address: 'Mirissa, Southern Province, Sri Lanka'
    },
    coordinates: {
      latitude: 5.9483,
      longitude: 80.4716
    },
    tags: ['Beach', 'Whale Watching', 'Surfing', 'Nightlife'],
    facilities: ['Beach Restaurants', 'Water Sports', 'Accommodation', 'Bars'],
    mainImage: '/uploads/mirissa.jpg',
    images: [
      '/uploads/mirissa-1.jpg',
      '/uploads/mirissa-2.jpg'
    ],
    visitorTips: [
      'Best time for whale watching is November to April',
      'Visit Secret Beach for a quieter experience',
      'Try surfing at the main beach',
      'Watch the sunset from Parrot Rock'
    ],
    bestTimeToVisit: 'November to April',
    entryFee: 'Free beach access',
    contactInfo: '+94 41 225 0200'
  }
];

export const seedDestinations = async () => {
  try {
    // Clear existing destinations
    await Destination.deleteMany({});
    
    // Insert new destinations
    await Destination.insertMany(destinations);
    
    console.log('Destinations seeded successfully');
  } catch (error) {
    console.error('Error seeding destinations:', error);
  }
};

export default destinations; 