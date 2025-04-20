# PICC Online Inventory Management System - API

This is the backend REST API for the PICC Online Inventory Management System, built with Express.js and MongoDB.

## Overview

The API provides all the necessary endpoints for managing inventory items, tracking stock changes, user authentication, and authorization. It follows RESTful principles and uses JSON Web Tokens (JWT) for secure authentication.

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **cookie-parser**: Cookie handling
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **multer**: File upload handling

## Directory Structure

```
api/
├── controllers/        # Request handlers for each route
├── models/            # MongoDB schemas and models
├── routes/            # API route definitions
├── utils/             # Utility functions and middleware
├── index.js           # API entry point
└── package.json       # Project dependencies
```

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate a user and return JWT
- `POST /api/auth/signout`: Sign out and clear cookies
- `GET /api/auth/refetch`: Refresh user data

### Users

- `GET /api/users`: Get all users (admin only)
- `GET /api/users/:id`: Get a specific user
- `PUT /api/users/:id`: Update a user
- `PUT /api/users/:id/active`: Toggle user active status (admin only)
- `DELETE /api/users/:id`: Delete a user (admin only)

### Items

- `GET /api/items`: Get all inventory items
- `GET /api/items/:id`: Get a specific item
- `POST /api/items`: Create a new item (admin only)
- `PUT /api/items/:id`: Update an item (admin only)
- `DELETE /api/items/:id`: Delete an item (admin only)

### Stock

- `GET /api/stock`: Get stock history (with optional date filters)
- `GET /api/stock/:id`: Get a specific stock record
- `POST /api/stock`: Add stock to an item
- `PUT /api/stock/:id`: Update a stock record (admin only)
- `DELETE /api/stock/:id`: Delete a stock record (admin only)

### Stock Usage

- `GET /api/stockUsage`: Get stock usage history (with optional date filters)
- `GET /api/stockUsage/:id`: Get a specific usage record
- `POST /api/stockUsage`: Record use of stock
- `PUT /api/stockUsage/:id`: Update a usage record (admin only)
- `DELETE /api/stockUsage/:id`: Delete a usage record (admin only)

## Models

### User

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String (URL),
  isAdmin: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Item

```javascript
{
  name: String,
  description: String,
  category: String,
  currentStock: Number,
  reorderThreshold: Number,
  image: String (URL),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Stock

```javascript
{
  item: ObjectId (ref: Item),
  quantity: Number,
  addedBy: ObjectId (ref: User),
  dateAdded: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### StockUsage

```javascript
{
  item: ObjectId (ref: Item),
  quantity: Number,
  usedBy: ObjectId (ref: User),
  dateUsed: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication & Authorization

The API uses JWT for authentication, stored in HTTP-only cookies for security. Middleware functions verify:

1. **Authentication**: Checks if the user is logged in
2. **Authorization**: Checks if the user has admin privileges for protected routes

## Setup and Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Environment Configuration
   Create a `.env` file in the root of the api directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

3. Development Mode
   ```bash
   npm run dev
   ```

4. Production Mode
   ```bash
   npm start
   ```

## Database Connection

The API connects to MongoDB via Mongoose. The connection is established in the `index.js` file:

```javascript
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });
```

## Error Handling

The API includes consistent error handling for:
- Validation errors
- Authentication errors
- Not found errors
- Server errors

Each error returns an appropriate HTTP status code and a JSON object with:
```javascript
{
  success: false,
  message: "Error message"
}
```

## Middleware

Custom middleware functions handle:
- Authentication verification
- Admin role verification
- Request body parsing
- CORS configuration
- File uploads with multer

## Security Considerations

- Passwords are hashed using bcrypt
- Authentication uses HTTP-only cookies
- JWT tokens have a controlled expiration time
- CORS is configured to allow only specified origins
- Input validation is performed on all routes

## Response Format

All API responses follow a consistent format:

**Success responses:**
```javascript
{
  success: true,
  [responseName]: responseData
}
```

**Error responses:**
```javascript
{
  success: false,
  message: "Error message"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License. 