# Ceylon Circuit - Technical Context

## Technology Stack

### Frontend Technologies
1. Core Framework
   - React.js (v18+)
   - React Router (v6+)
   - Redux Toolkit
   - Material-UI (v5+)

2. Development Tools
   - TypeScript
   - ESLint
   - Prettier
   - Jest
   - React Testing Library

3. Build Tools
   - Webpack
   - Babel
   - PostCSS
   - npm/yarn

### Backend Technologies
1. Core Framework
   - Node.js (v14+)
   - Express.js
   - MongoDB
   - Mongoose

2. Development Tools
   - Nodemon
   - ESLint
   - Prettier
   - Jest
   - Supertest

3. Build Tools
   - npm/yarn
   - Babel
   - Webpack (for SSR)

## Development Setup

### Prerequisites
1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. npm (v6 or higher) or yarn (v1.22 or higher)
4. Git

### Environment Variables
1. Frontend (.env)
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_WS_URL=ws://localhost:5000
   ```

2. Backend (.env)
   ```
   MONGODB_URI=mongodb://localhost:27017/ceylon-circuit
   JWT_SECRET=your-secret-key
   PORT=5000
   NODE_ENV=development
   ```

### Installation Steps
1. Clone Repository
   ```bash
   git clone https://github.com/sadulae/ceylon-circuit.git
   cd ceylon-circuit
   ```

2. Install Dependencies
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Start Development Servers
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## Technical Constraints

### Frontend Constraints
1. Browser Support
   - Chrome (latest 2 versions)
   - Firefox (latest 2 versions)
   - Safari (latest 2 versions)
   - Edge (latest 2 versions)

2. Performance Requirements
   - First Contentful Paint < 2s
   - Time to Interactive < 3.5s
   - Largest Contentful Paint < 2.5s

3. Accessibility
   - WCAG 2.1 AA compliance
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast requirements

### Backend Constraints
1. API Performance
   - Response time < 200ms
   - Throughput > 1000 requests/second
   - Error rate < 1%

2. Security Requirements
   - HTTPS only
   - CORS configuration
   - Rate limiting
   - Input validation

3. Database Constraints
   - Connection pool size
   - Query optimization
   - Indexing strategy
   - Backup frequency

## Dependencies

### Frontend Dependencies
1. Core Dependencies
   - react
   - react-dom
   - react-router-dom
   - @reduxjs/toolkit
   - @mui/material

2. Development Dependencies
   - @types/react
   - @types/react-dom
   - eslint
   - prettier
   - jest

### Backend Dependencies
1. Core Dependencies
   - express
   - mongoose
   - jsonwebtoken
   - bcrypt
   - cors

2. Development Dependencies
   - nodemon
   - eslint
   - prettier
   - jest
   - supertest 