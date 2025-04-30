# Ceylon Circuit - Travel Management System

A comprehensive travel management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User Authentication (Login/Register)
- Admin Dashboard
- Profile Management
- Trip Planning Bot with AI-powered chat interface
  - Modern dark mode support
  - Real-time chat with typing indicators
  - Quick action buttons for common queries
  - Rich text responses with formatted content
- Destination Management
- Accommodation Management
- Tour Package Management
- Modern UI/UX with Material-UI components
- Responsive design for all devices
- Dark/Light mode support
- Glass-morphism effects
- 3D animations and transitions

## Project Structure

```
ceylon-circuit/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # React components
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── home/     # Home page components
│   │   │   ├── layout/   # Layout components
│   │   │   ├── profile/  # Profile components
│   │   │   └── tripbot/  # Trip planning bot components
│   │   │       └── chat/ # Chat interface components
│   │   ├── redux/        # Redux state management
│   │   ├── assets/       # Images and other assets
│   │   └── App.js        # Main application component
│   └── package.json      # Frontend dependencies
│
├── server/                # Backend Node.js/Express application
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── scripts/         # Helper scripts
│   └── server.js        # Server entry point
│
├── .gitignore           # Git ignore file
├── LICENSE             # MIT License
└── README.md           # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ceylon-circuit
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Create a .env file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

## Running the Application

1. Start both server and client concurrently:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Features in Detail

### Trip Planning Bot
- Modern chat interface with real-time responses
- Dark/Light mode support
- Quick action buttons for common queries
- Rich text formatting for responses
- Typing indicators
- Smooth animations and transitions
- Mobile-responsive design

### UI/UX Improvements
- Glass-morphism effects throughout the interface
- 3D animations and transitions
- Modern Material-UI components
- Responsive design for all screen sizes
- Improved accessibility
- Better visual feedback for user interactions

## Admin Access

To create an admin user:

1. Run the admin seeding script:
   ```bash
   cd server
   npm run seed:admin
   ```

2. Login with the following credentials:
   - Email: admin@ceyloncircuit.com
   - Password: admin123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- Team Member 1 - Destination Management
- Team Member 2 - Accommodation Management
- Team Member 3 - Tour Package Management 