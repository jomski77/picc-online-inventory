# PICC Online Inventory Management System

A comprehensive inventory management system for PICC Insertion Teams, allowing for tracking stock levels, usage, and providing insights through charts and reports.

## Features

- User authentication and role-based access control
- Inventory management (add, update, delete items)
- Stock tracking (add stock, record usage)
- Dashboard with charts and metrics
- User management for admins
- Profile management for users

## Tech Stack

- **Frontend**: React, Redux Toolkit, Chart.js, Tailwind CSS, Flowbite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Storage**: Supabase for image storage
- **Deployment**: Render

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB connection (local or Atlas)

### API Setup

1. Navigate to the API directory:
```
cd picc-online-inventory/api
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start the development server:
```
npm run dev
```

### Client Setup

1. Navigate to the client directory:
```
cd picc-online-inventory/client
```

2. Install dependencies:
```
npm install
```

3. Make sure you have the necessary environment files:

`.env.development`:
```
VITE_API_MODE=development
VITE_API_BASE_URL_DEVELOPMENT=http://localhost:3000
VITE_API_BASE_URL_PRODUCTION=https://picc-inventory-api.onrender.com
```

4. Start the development server:
```
npm run dev
```

## Deployment

The application is configured for deployment on Render using the `render.yaml` file in the client directory.

### Deploy on Render

1. Create a Render account and connect your GitHub repository
2. Use the Blueprint feature to deploy both the API and client from the `render.yaml` file
3. Ensure environment variables are set correctly in the Render dashboard

### Manual Deployment

**API:**
1. Build and start the API:
```
npm install
npm start
```

**Client:**
1. Build the client:
```
npm install
npm run build
```
2. Deploy the `dist` directory to a static hosting service

## License

ISC 