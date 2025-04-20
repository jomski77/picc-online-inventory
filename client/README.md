# PICC Online Inventory Management System - Client

This is the frontend React application for the PICC Online Inventory Management System.

## Overview

The client-side application provides a modern, responsive UI for healthcare professionals to manage inventory of PICC line insertion supplies. Built with React and styled with Tailwind CSS and Flowbite components, it offers a clean and intuitive user experience.

## Technologies Used

- **React 18**: Modern frontend framework
- **Redux Toolkit**: State management
- **React Router 6**: Navigation and routing
- **Tailwind CSS & Flowbite**: Styling and UI components
- **Chart.js**: Data visualization
- **Highcharts**: Advanced charting for activity visualization
- **Vite**: Fast development and optimized production builds
- **Supabase**: Storage for images and file uploads

## Directory Structure

```
client/
├── public/              # Public assets
├── src/                 # Source files
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components for each route
│   ├── redux/           # Redux store, slices, and actions
│   ├── utils/           # Utility functions and helpers
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── index.html           # HTML template
└── vite.config.js       # Vite configuration
```

## Key Components

### Pages

- **Home**: Landing page with application overview
- **SignIn/SignUp**: Authentication pages
- **Dashboard**: Main overview with metrics and recent activity
- **ItemList**: Comprehensive list of inventory items
- **AddStock/UseStock**: Forms for adding and using supplies
- **StockHistory/UsageHistory**: History logs for stock changes
- **ActivityHistory**: Combined view of all stock activities
- **ActivityChart**: Visual representation of stock usage trends
- **Profile**: User profile management
- **ManageUsers**: Admin interface for user management
- **CreateItem/UpdateItem**: Forms for managing inventory items

### Components

- **Header**: Navigation bar with user menu
- **Footer**: Application footer with links and information
- **PrivateRoute**: Route protection for authenticated users
- **AdminRoute**: Route protection for admin users

## Features

1. **Authentication**
   - User login and registration
   - Persistent sessions with Redux Persist
   - Role-based access control

2. **Inventory Management**
   - Real-time stock tracking
   - Low stock alerts
   - Item categorization

3. **Activity Tracking**
   - Stock addition tracking
   - Usage tracking with detailed history
   - Filtering and sorting capabilities

4. **Data Visualization**
   - Interactive charts for stock trends
   - Activity patterns visualization
   - Theme-responsive charts

5. **User Experience**
   - Responsive design for all devices
   - Dark/Light theme support
   - Real-time feedback on actions

6. **Admin Functionality**
   - User management (activate/deactivate, delete)
   - Item creation and modification
   - Historical record editing

## Setup and Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Environment Configuration
   Create a `.env` file in the root of the client directory:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   ```

3. Development Mode
   ```bash
   npm run dev
   ```

4. Build for Production
   ```bash
   npm run build
   ```

5. Preview Production Build
   ```bash
   npm run preview
   ```

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **userSlice**: Authentication state, user information
- **themeSlice**: Application theme preferences

State persistence is handled with Redux Persist to maintain the user session.

## API Integration

The client communicates with the backend API through RESTful endpoints. All API requests include credentials to maintain authentication state.

## Routing

React Router v6 is used for navigation, with the following route structure:

- Public routes: Home, SignIn, SignUp
- Private routes (authenticated users): Dashboard, AddStock, UseStock, etc.
- Admin routes: ManageUsers, CreateItem, UpdateItem, etc.

## Styling

The application uses:
- Tailwind CSS for utility-first styling
- Flowbite components for consistent UI elements
- Custom styling for specific components
- Theme support for light and dark modes

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoints for different screen sizes
- Collapsible navigation for small screens
- Optimized layouts for all devices

## Browser Compatibility

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License. 