# MongoDB Migration Guide - From Mongoose to Native Driver

This guide explains the migration from Mongoose ODM to the native MongoDB driver for the Kisaan application.

## 🔄 Migration Overview

### What Changed

- **Database Layer**: Replaced Mongoose with native MongoDB driver (v6.19.0)
- **Architecture**: Implemented Repository pattern for better separation of concerns
- **Module System**: Updated from CommonJS to ES6 modules
- **Authentication**: Enhanced JWT-based authentication with refresh tokens
- **Error Handling**: Improved error handling and validation
- **Configuration**: Environment-based configuration

### Key Benefits

- ✅ **Performance**: Native driver is faster and uses less memory
- ✅ **Flexibility**: Direct control over MongoDB operations
- ✅ **Modern**: Uses latest MongoDB features and ES6 syntax
- ✅ **Scalability**: Better connection pooling and resource management
- ✅ **Maintainability**: Clean repository pattern with separation of concerns

## 📁 New Architecture

### Repository Pattern

```
server/
├── config/
│   ├── database.js          # MongoDB connection management
│   └── config.js           # Application configuration
├── repositories/
│   ├── BaseRepository.js   # Base CRUD operations
│   ├── UserRepository.js   # User-specific operations
│   └── index.js           # Repository exports
├── middleware/
│   └── auth.js            # JWT authentication middleware
└── routes/
    ├── loginRoutes.js     # Updated authentication routes
    └── index.js          # Route exports
```

### Database Connection

- **File**: `config/database.js`
- **Features**:
  - Connection pooling
  - Automatic reconnection
  - Graceful shutdown
  - Error handling

### Repository Layer

- **BaseRepository**: Common CRUD operations
- **UserRepository**: User-specific methods with validation
- **Type Safety**: ObjectId handling and data transformation

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `EMAIL_USERNAME` & `EMAIL_PASSWORD`: Email credentials

### 3. Start the Server

```bash
npm start
```

## 🔧 API Changes

### Authentication Endpoints

#### Signup

```http
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "contact": "1234567890",
  "password": "SecurePass123!",
  "role": "buyer"
}
```

#### Login

```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "status": true,
  "message": "Login successful",
  "user": { ... },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Token Refresh

```http
POST /refresh-token
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### Protected Routes

Use Bearer token in Authorization header:

```http
Authorization: Bearer <accessToken>
```

## 🔒 Security Enhancements

### Password Security

- **Bcrypt**: 12 salt rounds for password hashing
- **Validation**: Strong password requirements
- **Rate Limiting**: Protection against brute force attacks

### JWT Tokens

- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Secure**: HS256 algorithm with strong secrets

### Input Validation

- **Email**: RFC compliant email validation
- **Phone**: 10-digit Indian phone number format
- **Password**: Minimum 6 characters with complexity requirements

## 📊 Database Operations

### User Operations

```javascript
import { userInfo } from "./repositories/index.js";

// Create user
const user = await userInfo.createUser(userData);

// Find by email
const user = await userInfo.getUserByEmail("user@example.com");

// Authenticate
const user = await userInfo.authenticateUser(email, password);

// Update password
await userInfo.updatePassword(email, newPassword);

// Generate OTP
const { otp } = await userInfo.generateOTP(email);

// Verify OTP
const verifiedUser = await userInfo.verifyOTP(email, otp);
```

### Generic Operations

```javascript
// Find documents
const users = await userInfo.find({ role: "buyer" }, { limit: 10 });

// Update document
await userInfo.updateById(userId, { isActive: false });

// Delete document
await userInfo.deleteById(userId);

// Count documents
const count = await userInfo.count({ isActive: true });
```

## 🔍 Migration Checklist

### Database Schema

- [x] User schema validation
- [x] Indexes creation
- [x] Data type consistency
- [ ] Migrate other models (Bank, Seed, Seller, Request)

### API Endpoints

- [x] Authentication routes
- [x] User management
- [x] JWT token handling
- [ ] Update other route handlers

### Testing

- [ ] Unit tests for repositories
- [ ] Integration tests for APIs
- [ ] Load testing with new driver

### Deployment

- [ ] Environment configuration
- [ ] Database connection strings
- [ ] Performance monitoring

## 🐛 Troubleshooting

### Common Issues

#### Connection Errors

```bash
Error: connect ECONNREFUSED
```

**Solution**: Check MongoDB connection string and network access

#### Authentication Errors

```bash
Error: Invalid or expired token
```

**Solution**: Verify JWT secret and token format

#### Validation Errors

```bash
Error: Validation failed
```

**Solution**: Check required fields and data formats

### Performance Monitoring

- Monitor connection pool usage
- Check query performance
- Watch memory consumption
- Track error rates

## 📚 Additional Resources

- [MongoDB Node.js Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Repository Pattern in Node.js](https://blog.logrocket.com/using-repository-pattern-node-js/)

## 🤝 Contributing

When adding new models or repositories:

1. Extend `BaseRepository` for common operations
2. Add model-specific methods in dedicated repository
3. Update `repositories/index.js` exports
4. Add proper validation and error handling
5. Include JSDoc comments for methods

## 📝 Notes

- All database operations are now async/await
- ObjectId conversion is handled automatically
- Timestamps are managed by repositories
- Error handling is consistent across all operations
- Connection pooling optimizes performance
