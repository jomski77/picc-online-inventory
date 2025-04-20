# PICC Online Inventory Management System

A comprehensive inventory management system designed specifically for PICC (Peripherally Inserted Central Catheter) insertion teams in healthcare settings.

## Project Overview

This application helps medical teams track and manage their inventory of supplies used for PICC line insertions. It provides features for:

- Real-time inventory tracking
- Stock usage and addition history
- Low stock alerts
- User management with different permission levels
- Activity visualization through charts and reports

## Project Structure

The project is organized as a full-stack JavaScript application with separate frontend and backend components:

- `api/` - Backend Express.js API with MongoDB integration
- `client/` - Frontend React application built with Vite
- Documentation and configuration files

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password encryption
- RESTful API design

### Frontend
- React 18
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS & Flowbite for styling
- Chart.js for data visualization
- Vite for development and building

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or newer)
- npm (v6 or newer)
- MongoDB (local or Atlas connection)

## Installation & Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd picc-online-inventory
   ```

2. Install dependencies
   ```bash
   npm install
   cd api && npm install
   cd ../client && npm install
   ```

3. Environment Configuration

   **For API (.env file in api/ directory):**
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

   **For Client (.env file in client/ directory):**
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Running the Application

   **Development Mode (runs both API and client concurrently):**
   ```bash
   npm run dev
   ```

   **Running API and Client Separately:**
   ```bash
   # For API
   npm run dev:api
   
   # For Client
   npm run start:client
   ```

5. Building for Production
   ```bash
   # Build client
   npm run build:client
   
   # Start production server
   npm start
   ```

## Key Features

- **Authentication System**: Secure login/signup with JWT
- **Dashboard**: Overview of inventory metrics, low stock alerts, and recent activity
- **Supply Management**: Add, use, and track supplies
- **Activity Charts**: Visualize stock usage patterns
- **User Management**: Admin controls for managing team members
- **History Tracking**: Complete history of stock additions and usage

## API Endpoints

The API provides endpoints for:
- User authentication (/api/auth)
- Item management (/api/items)
- Stock operations (/api/stock)
- Stock usage tracking (/api/stockUsage)
- User management (/api/users)

For detailed API documentation, refer to the API README in the `/api` directory.

## User Roles

- **Regular Users**: Can view inventory, add/use stock, and view history
- **Administrators**: Additional abilities to manage users, create/update items, and edit records

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contributors

- PICC Team

## Support

For support or feature requests, please contact the project maintainers. 