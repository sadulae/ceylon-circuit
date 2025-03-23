# Ceylon Circuit - Travel Management System

A comprehensive travel management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User Authentication (Login/Register)
- Admin Dashboard
- Profile Management
- Trip Planning Bot
- Destination Management
- Accommodation Management
- Tour Package Management

## Project Structure

```
ceylon-circuit/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # React components
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
└── README.md            # Project documentation
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

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`

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

## Available Scripts

In the server directory:
- `npm run dev`: Start the server in development mode
- `npm start`: Start the server in production mode
- `npm run seed:admin`: Create an admin user

In the client directory:
- `npm start`: Start the development server
- `npm build`: Build the application for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Team

- Team Member 1 - Destination Management
- Team Member 2 - Accommodation Management
- Team Member 3 - Tour Package Management 