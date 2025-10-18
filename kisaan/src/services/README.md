# Service Layer Architecture

This directory contains all API service files for the Khetihat application. The service layer centralizes all API calls, making the codebase cleaner, more maintainable, and easier to test.

## Structure

```
services/
├── api.js              # Base axios instance with interceptors
├── authService.js      # Authentication-related APIs
├── userService.js      # User management APIs
├── itemService.js      # Item/Product management APIs
├── requestService.js   # Request management APIs
├── index.js            # Central export file
└── README.md           # This file
```

## Files Overview

### api.js
Base axios client with:
- **Base URL configuration**: Uses `baseUrl` from `baseUrl.js`
- **Timeout**: 30 seconds default
- **Request Interceptor**: Automatically adds auth token from localStorage
- **Response Interceptor**: Global error handling for 401, 403, 404, 500 errors

### authService.js
Authentication-related API methods:
- `signup(userData)` - User registration
- `login(credentials)` - User login
- `sendOTP(email)` - Send OTP to email
- `sendOTPWithMethod(data)` - Send OTP via email or SMS
- `verifyOTP(data)` - Verify OTP
- `verifyPhoneOTP(data)` - Verify Firebase phone OTP
- `changePassword(data)` - Change user password
- `logout()` - Logout user

### userService.js
User management API methods:
- `getProfile()` - Get user profile
- `updateProfile(userData)` - Update user profile
- `getAllBuyers()` - Get all buyer users
- `getAllSellers()` - Get all seller users
- `getAllUsers()` - Get all users

### itemService.js
Item/Product management API methods:
- `getAllItems(token)` - Get all items for authenticated user
- `getItemsList(params)` - Get items list with filters and pagination
- `editItem(itemData)` - Edit/Update an item
- `deleteItem(deleteData)` - Delete an item
- `addSellerData(sellerData)` - Add seller product/data
- `uploadFile(formData)` - Upload file (image)

### requestService.js
Request management API methods:
- `getAllRequests(token)` - Get all requests for authenticated user
- `getRequestData(requestData)` - Get request data/status
- `addRequest(requestData)` - Add a new request (follow seller)
- `approveOrDenyRequest(actionData)` - Approve or deny a request

## Usage

### Import in Components

```javascript
// Import specific services
import { authService, itemService, requestService } from '../../services';

// Or import all services
import services from '../../services';
```

### Example: Signup

```javascript
import { authService } from '../../services';

const handleSignup = async () => {
  const result = await authService.signup({
    name: "John Doe",
    email: "john@example.com",
    contact: "9876543210",
    password: "Password123!"
  });

  if (result.success) {
    console.log('Signup successful:', result.data);
    // Handle success
  } else {
    console.error('Signup failed:', result.error);
    // Handle error
  }
};
```

### Example: Login

```javascript
import { authService } from '../../services';

const handleLogin = async () => {
  const result = await authService.login({
    email: "john@example.com",
    password: "Password123!"
  });

  if (result.success && result.data.status) {
    localStorage.setItem('token', result.data.message);
    // Redirect to home
  } else {
    // Show error message
  }
};
```

### Example: Send OTP

```javascript
import { authService } from '../../services';

// Send via email
const result = await authService.sendOTP("user@example.com");

// Send via SMS or email
const result = await authService.sendOTPWithMethod({
  method: 'sms',  // or 'email'
  contact: '9876543210',
  email: 'user@example.com'
});
```

### Example: Get Users

```javascript
import { userService } from '../../services';

const fetchBuyers = async () => {
  const result = await userService.getAllBuyers();
  
  if (result.success) {
    console.log('Buyers:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Example: Get Items List

```javascript
import { itemService } from '../../services';

const fetchItems = async () => {
  const token = localStorage.getItem('token');
  const result = await itemService.getAllItems(token);
  
  if (result.success && result.data.status) {
    console.log('Items:', result.data.message);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Example: Add Request

```javascript
import { requestService } from '../../services';

const followSeller = async (sellerData) => {
  const requestData = {
    sellerId: sellerData.id,
    buyerId: currentUser.id,
    token: localStorage.getItem('token'),
    // ... other data
  };
  
  const result = await requestService.addRequest(requestData);
  
  if (result.success) {
    console.log('Request sent successfully');
  } else {
    console.error('Error:', result.error);
  }
};
```

## Response Format

All service methods return a consistent response format:

### Success Response
```javascript
{
  success: true,
  data: {
    status: true,
    message: "Success message",
    // ... other data
  }
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message string"
}
```

## Adding New Services

To add a new service:

1. **Create service file** (e.g., `productService.js`):

```javascript
import apiClient from './api';

const productService = {
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },
  
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product',
      };
    }
  },
};

export default productService;
```

2. **Export in index.js**:

```javascript
import productService from './productService';

export { authService, userService, productService };

export default {
  auth: authService,
  user: userService,
  product: productService,
};
```

## Benefits

✅ **Centralized API calls** - All endpoints in one place  
✅ **Consistent error handling** - Unified error format  
✅ **Automatic token management** - Auth token added automatically  
✅ **Easy testing** - Mock services easily  
✅ **Better maintenance** - Update APIs in one location  
✅ **Clean components** - Components focus on UI logic  
✅ **TypeScript ready** - Easy to add type definitions later  

## Best Practices

1. **Always use services in components** - Never import axios directly
2. **Handle both success and error cases** - Check `result.success`
3. **Destructure response data** - `const { success, data, error } = result`
4. **Add JSDoc comments** - Document parameters and return types
5. **Keep services pure** - No UI logic in service files

## Environment Variables

Make sure these are set in your `.env`:

```env
REACT_APP_BASEURL=http://localhost:8080
# or for production
REACT_APP_BASEURL=https://your-api.com
```

## Updated Components

The following components have been updated to use the service layer:

**Authentication Components:**
- ✅ `signUpComponent/signup.js`
- ✅ `loginComponent/login.js`
- ✅ `otpVerifyComponent/otpVerify.js`
- ✅ `forgotPasswordComponent/forgotPassword.js`

**Home Sub Components:**
- ✅ `HomeSubComponents/AllAccountsComponent/AllAccounts.js`
- ✅ `HomeSubComponents/BuyerComponent/Buyer.js`
- ✅ `HomeSubComponents/SellerComponent/Seller.js`
- ✅ `HomeSubComponents/RequestComponent/Request.js`

## Next Steps for Firebase Integration

When you're ready to add Firebase Phone Authentication:

1. Install Firebase: `npm install firebase`
2. Create `services/firebaseService.js`
3. Update `authService.js` to include Firebase methods
4. Add Firebase config to your components

For detailed Firebase integration guide, see the Firebase documentation in our previous conversation.

