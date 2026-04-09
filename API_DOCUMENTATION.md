# 🔌 API DOCUMENTATION - Aura Shop Backend Requirements

**Project**: Aura Shop E-commerce Application  
**Last Updated**: April 9, 2026  
**Frontend Stack**: React 18.3 + TypeScript + React Router  
**Expected Backend**: Node.js/Express, Python/Django, Java/Spring, or similar REST API

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication APIs](#authentication-apis)
3. [Product APIs](#product-apis)
4. [Cart APIs](#cart-apis)
5. [Order APIs](#order-apis)
6. [User/Account APIs](#useraccount-apis)
7. [Review APIs](#review-apis)
8. [Wishlist APIs](#wishlist-apis)
9. [Category APIs](#category-apis)
10. [Error Handling](#error-handling)

---

## Overview

### Base URL
```
http://localhost:3000/api
or
https://api.aurashop.com/api
```

### Authentication
- **Type**: JWT (Bearer Token)
- **Header**: `Authorization: Bearer {token}`
- **Token Location**: Stored in localStorage as `authToken`
- **Token Refresh**: Implement refresh token mechanism for long sessions

### Response Format
All responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "statusCode": 200
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": {}
}
```

---

## Authentication APIs

### 1. Register User
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_xyz"
  },
  "message": "User registered successfully"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Email already exists",
  "statusCode": 400
}
```

---

### 2. Login User
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "avatar": "https://api.aurashop.com/avatars/user_123.jpg",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_xyz"
  },
  "message": "Login successful"
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": "Invalid email or password",
  "statusCode": 401
}
```

---

### 3. Logout User
**Endpoint**: `POST /auth/logout`

**Headers**: 
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Refresh Token
**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "refresh_token_xyz"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  },
  "message": "Token refreshed successfully"
}
```

---

### 5. Verify Token
**Endpoint**: `GET /auth/verify`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "valid": true
  },
  "message": "Token is valid"
}
```

---

## Product APIs

### 1. Get All Products
**Endpoint**: `GET /products`

**Query Parameters**:
```
?page=1
&limit=20
&sort=default (default|price-asc|price-desc|rating|newest)
&category=electronics
&subcategory=phones
&minPrice=0
&maxPrice=1500
&search=laptop
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Premium Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "price": 299.99,
        "originalPrice": 399.99,
        "discount": 25,
        "category": "Electronics",
        "subcategory": "Audio",
        "image": "https://api.aurashop.com/products/prod_001.jpg",
        "images": [
          "https://api.aurashop.com/products/prod_001_1.jpg",
          "https://api.aurashop.com/products/prod_001_2.jpg"
        ],
        "rating": 4.5,
        "reviews": 128,
        "stock": 45,
        "inStock": true,
        "badge": "Best Seller",
        "tags": ["Sale", "Hot Deal"],
        "specifications": {
          "color": "Black",
          "batteryLife": "30 hours",
          "connectivity": "Bluetooth 5.0"
        },
        "createdAt": "2026-01-15T10:30:00Z",
        "updatedAt": "2026-04-09T15:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "message": "Products retrieved successfully"
}
```

---

### 2. Get Single Product
**Endpoint**: `GET /products/{productId}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Premium Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "fullDescription": "Detailed product description with features and benefits...",
    "price": 299.99,
    "originalPrice": 399.99,
    "discount": 25,
    "category": "Electronics",
    "subcategory": "Audio",
    "image": "https://api.aurashop.com/products/prod_001.jpg",
    "images": [
      "https://api.aurashop.com/products/prod_001_1.jpg",
      "https://api.aurashop.com/products/prod_001_2.jpg",
      "https://api.aurashop.com/products/prod_001_3.jpg"
    ],
    "rating": 4.5,
    "reviews": 128,
    "stock": 45,
    "inStock": true,
    "badge": "Best Seller",
    "tags": ["Sale", "Hot Deal", "New"],
    "specifications": {
      "color": ["Black", "White", "Silver"],
      "batteryLife": "30 hours",
      "connectivity": "Bluetooth 5.0",
      "weight": "250g",
      "warranty": "2 years"
    },
    "relatedProducts": [
      {
        "id": "prod_002",
        "name": "Related Product",
        "price": 199.99,
        "image": "https://api.aurashop.com/products/prod_002.jpg"
      }
    ],
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-04-09T15:45:00Z"
  },
  "message": "Product retrieved successfully"
}
```

---

### 3. Get Product Reviews
**Endpoint**: `GET /products/{productId}/reviews`

**Query Parameters**:
```
?page=1
&limit=10
&sort=recent (recent|helpful|rating)
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_001",
        "productId": "prod_001",
        "userId": "user_123",
        "author": {
          "id": "user_123",
          "name": "Sarah M.",
          "avatar": "https://api.aurashop.com/avatars/user_123.jpg"
        },
        "rating": 5,
        "title": "Excellent Quality!",
        "comment": "Absolutely love this product! The quality exceeded my expectations.",
        "verified": true,
        "helpful": 24,
        "notHelpful": 0,
        "date": "2026-02-15T08:30:00Z",
        "images": [
          "https://api.aurashop.com/reviews/review_001_1.jpg"
        ]
      }
    ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 128,
      "ratingDistribution": {
        "5": 68,
        "4": 20,
        "3": 8,
        "2": 3,
        "1": 1
      }
    }
  },
  "message": "Reviews retrieved successfully"
}
```

---

## Cart APIs

### 1. Get Cart
**Endpoint**: `GET /cart`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "cartId": "cart_123",
    "userId": "user_123",
    "items": [
      {
        "id": "cartitem_001",
        "productId": "prod_001",
        "quantity": 2,
        "price": 299.99,
        "total": 599.98,
        "product": {
          "id": "prod_001",
          "name": "Premium Wireless Headphones",
          "image": "https://api.aurashop.com/products/prod_001.jpg",
          "stock": 45
        }
      }
    ],
    "subtotal": 599.98,
    "tax": 47.99,
    "shipping": 10.00,
    "discount": 0,
    "total": 657.97,
    "itemCount": 2,
    "createdAt": "2026-04-08T10:30:00Z",
    "updatedAt": "2026-04-09T15:45:00Z"
  },
  "message": "Cart retrieved successfully"
}
```

---

### 2. Add to Cart
**Endpoint**: `POST /cart/items`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "productId": "prod_001",
  "quantity": 2,
  "specifications": {
    "color": "Black"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "cartId": "cart_123",
    "item": {
      "id": "cartitem_001",
      "productId": "prod_001",
      "quantity": 2,
      "price": 299.99,
      "total": 599.98
    },
    "cart": {
      "subtotal": 599.98,
      "tax": 47.99,
      "shipping": 10.00,
      "total": 657.97,
      "itemCount": 2
    }
  },
  "message": "Item added to cart successfully"
}
```

---

### 3. Update Cart Item
**Endpoint**: `PUT /cart/items/{cartItemId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "cartitem_001",
      "productId": "prod_001",
      "quantity": 3,
      "price": 299.99,
      "total": 899.97
    },
    "cart": {
      "subtotal": 899.97,
      "tax": 71.99,
      "shipping": 10.00,
      "total": 981.96,
      "itemCount": 3
    }
  },
  "message": "Cart item updated successfully"
}
```

---

### 4. Remove from Cart
**Endpoint**: `DELETE /cart/items/{cartItemId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "cart": {
      "subtotal": 299.98,
      "tax": 23.99,
      "shipping": 10.00,
      "total": 333.97,
      "itemCount": 1
    }
  },
  "message": "Item removed from cart successfully"
}
```

---

### 5. Clear Cart
**Endpoint**: `DELETE /cart`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "cartId": "cart_123",
    "itemCount": 0
  },
  "message": "Cart cleared successfully"
}
```

---

### 6. Apply Coupon
**Endpoint**: `POST /cart/coupon`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "couponCode": "SAVE20"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "minAmount": 50
    },
    "cart": {
      "subtotal": 599.98,
      "discount": 119.99,
      "tax": 47.99,
      "shipping": 10.00,
      "total": 537.98
    }
  },
  "message": "Coupon applied successfully"
}
```

---

## Order APIs

### 1. Create Order
**Endpoint**: `POST /orders`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "shippingMethodId": "shipping_001",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  },
  "paymentMethodId": "payment_001",
  "notes": "Please deliver after 3 PM"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "orderId": "order_12345",
    "orderNumber": "#ORD-2026-001234",
    "userId": "user_123",
    "status": "pending",
    "items": [
      {
        "productId": "prod_001",
        "name": "Premium Wireless Headphones",
        "quantity": 2,
        "price": 299.99,
        "total": 599.98
      }
    ],
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States"
    },
    "billingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States"
    },
    "shippingMethod": {
      "id": "shipping_001",
      "name": "Standard Shipping",
      "cost": 10.00,
      "estimatedDays": 5
    },
    "subtotal": 599.98,
    "tax": 47.99,
    "shipping": 10.00,
    "discount": 0,
    "total": 657.97,
    "paymentStatus": "pending",
    "createdAt": "2026-04-09T16:00:00Z"
  },
  "message": "Order created successfully"
}
```

---

### 2. Get Order
**Endpoint**: `GET /orders/{orderId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "orderId": "order_12345",
    "orderNumber": "#ORD-2026-001234",
    "userId": "user_123",
    "status": "processing",
    "items": [
      {
        "id": "orderitem_001",
        "productId": "prod_001",
        "name": "Premium Wireless Headphones",
        "quantity": 2,
        "price": 299.99,
        "total": 599.98,
        "image": "https://api.aurashop.com/products/prod_001.jpg"
      }
    ],
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States"
    },
    "shippingMethod": {
      "id": "shipping_001",
      "name": "Standard Shipping",
      "cost": 10.00,
      "estimatedDays": 5
    },
    "tracking": {
      "trackingNumber": "1Z999AA10123456784",
      "carrier": "UPS",
      "estimatedDelivery": "2026-04-14",
      "status": "In Transit"
    },
    "subtotal": 599.98,
    "tax": 47.99,
    "shipping": 10.00,
    "total": 657.97,
    "paymentStatus": "completed",
    "paymentMethod": "Credit Card",
    "createdAt": "2026-04-09T16:00:00Z",
    "updatedAt": "2026-04-09T17:30:00Z"
  },
  "message": "Order retrieved successfully"
}
```

---

### 3. Get User Orders
**Endpoint**: `GET /orders`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
```
?page=1
&limit=10
&status=all (all|pending|processing|shipped|delivered|cancelled)
&sort=recent
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "order_12345",
        "orderNumber": "#ORD-2026-001234",
        "status": "processing",
        "itemCount": 2,
        "total": 657.97,
        "createdAt": "2026-04-09T16:00:00Z",
        "estimatedDelivery": "2026-04-14"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  },
  "message": "Orders retrieved successfully"
}
```

---

### 4. Cancel Order
**Endpoint**: `PUT /orders/{orderId}/cancel`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "orderId": "order_12345",
    "status": "cancelled",
    "refundStatus": "pending",
    "message": "Order cancellation requested. Refund will be processed within 5-7 business days."
  },
  "message": "Order cancelled successfully"
}
```

---

## User/Account APIs

### 1. Get User Profile
**Endpoint**: `GET /users/profile`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "avatar": "https://api.aurashop.com/avatars/user_123.jpg",
    "role": "customer",
    "status": "active",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-04-09T15:45:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

---

### 2. Update User Profile
**Endpoint**: `PUT /users/profile`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+1-555-0123",
  "avatar": "base64_image_data"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "avatar": "https://api.aurashop.com/avatars/user_123.jpg"
  },
  "message": "Profile updated successfully"
}
```

---

### 3. Get Addresses
**Endpoint**: `GET /users/addresses`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "address_001",
      "label": "Home",
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "apartment": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States",
      "phone": "+1-555-0123",
      "isDefault": true,
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "address_002",
      "label": "Work",
      "firstName": "John",
      "lastName": "Doe",
      "address": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "postalCode": "10002",
      "country": "United States",
      "phone": "+1-555-0456",
      "isDefault": false,
      "createdAt": "2026-02-10T14:20:00Z"
    }
  ],
  "message": "Addresses retrieved successfully"
}
```

---

### 4. Add Address
**Endpoint**: `POST /users/addresses`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "label": "Work",
  "firstName": "John",
  "lastName": "Doe",
  "address": "456 Business Ave",
  "apartment": "Suite 100",
  "city": "New York",
  "state": "NY",
  "postalCode": "10002",
  "country": "United States",
  "phone": "+1-555-0456",
  "isDefault": false
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "address_002",
    "label": "Work",
    "firstName": "John",
    "lastName": "Doe",
    "address": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "postalCode": "10002",
    "country": "United States",
    "phone": "+1-555-0456",
    "isDefault": false
  },
  "message": "Address added successfully"
}
```

---

### 5. Update Address
**Endpoint**: `PUT /users/addresses/{addressId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "label": "Work",
  "address": "789 New Business Ave",
  "isDefault": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "address_002",
    "label": "Work",
    "address": "789 New Business Ave",
    "city": "New York",
    "state": "NY",
    "postalCode": "10002",
    "country": "United States",
    "isDefault": true
  },
  "message": "Address updated successfully"
}
```

---

### 6. Delete Address
**Endpoint**: `DELETE /users/addresses/{addressId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "address_002",
    "deleted": true
  },
  "message": "Address deleted successfully"
}
```

---

### 7. Change Password
**Endpoint**: `PUT /users/change-password`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Review APIs

### 1. Submit Review
**Endpoint**: `POST /products/{productId}/reviews`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "rating": 5,
  "title": "Excellent Quality!",
  "comment": "Absolutely love this product! The quality exceeded my expectations. Fast shipping too.",
  "images": [
    "base64_image_data_1",
    "base64_image_data_2"
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "review_001",
    "productId": "prod_001",
    "userId": "user_123",
    "rating": 5,
    "title": "Excellent Quality!",
    "comment": "Absolutely love this product! The quality exceeded my expectations.",
    "verified": true,
    "helpful": 0,
    "notHelpful": 0,
    "date": "2026-04-09T16:30:00Z",
    "images": [
      "https://api.aurashop.com/reviews/review_001_1.jpg",
      "https://api.aurashop.com/reviews/review_001_2.jpg"
    ]
  },
  "message": "Review submitted successfully"
}
```

---

### 2. Update Review
**Endpoint**: `PUT /reviews/{reviewId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "review_001",
    "rating": 4,
    "comment": "Updated review comment",
    "updatedAt": "2026-04-09T17:00:00Z"
  },
  "message": "Review updated successfully"
}
```

---

### 3. Mark Review as Helpful
**Endpoint**: `POST /reviews/{reviewId}/helpful`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "helpful": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "review_001",
    "helpful": 25,
    "notHelpful": 0
  },
  "message": "Review marked as helpful"
}
```

---

### 4. Delete Review
**Endpoint**: `DELETE /reviews/{reviewId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Wishlist APIs

### 1. Get Wishlist
**Endpoint**: `GET /wishlist`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "wishlist_001",
      "productId": "prod_001",
      "name": "Premium Wireless Headphones",
      "price": 299.99,
      "originalPrice": 399.99,
      "discount": 25,
      "image": "https://api.aurashop.com/products/prod_001.jpg",
      "rating": 4.5,
      "inStock": true,
      "addedAt": "2026-04-08T10:30:00Z"
    },
    {
      "id": "wishlist_002",
      "productId": "prod_002",
      "name": "USB-C Cable",
      "price": 12.99,
      "originalPrice": 19.99,
      "discount": 35,
      "image": "https://api.aurashop.com/products/prod_002.jpg",
      "rating": 4.8,
      "inStock": true,
      "addedAt": "2026-04-07T15:20:00Z"
    }
  ],
  "message": "Wishlist retrieved successfully"
}
```

---

### 2. Add to Wishlist
**Endpoint**: `POST /wishlist`

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "productId": "prod_001"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "wishlist_001",
    "productId": "prod_001",
    "name": "Premium Wireless Headphones",
    "addedAt": "2026-04-09T16:30:00Z"
  },
  "message": "Product added to wishlist"
}
```

---

### 3. Remove from Wishlist
**Endpoint**: `DELETE /wishlist/{wishlistId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "wishlist_001",
    "removed": true
  },
  "message": "Product removed from wishlist"
}
```

---

### 4. Check if Product in Wishlist
**Endpoint**: `GET /wishlist/check/{productId}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "productId": "prod_001",
    "inWishlist": true,
    "wishlistId": "wishlist_001"
  },
  "message": "Wishlist check completed"
}
```

---

## Category APIs

### 1. Get All Categories
**Endpoint**: `GET /categories`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "slug": "electronics",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "icon": "Zap",
      "image": "https://api.aurashop.com/categories/electronics.jpg",
      "productCount": 245,
      "featured": true,
      "children": [
        {
          "id": "subcat_001",
          "slug": "phones",
          "name": "Phones",
          "icon": "Smartphone",
          "productCount": 120
        },
        {
          "id": "subcat_002",
          "slug": "laptops",
          "name": "Laptops",
          "icon": "Laptop",
          "productCount": 85
        },
        {
          "id": "subcat_003",
          "slug": "audio",
          "name": "Audio",
          "icon": "Headphones",
          "productCount": 40
        }
      ]
    },
    {
      "id": "cat_002",
      "slug": "fashion",
      "name": "Fashion",
      "description": "Clothing and accessories",
      "icon": "Shirt",
      "image": "https://api.aurashop.com/categories/fashion.jpg",
      "productCount": 520,
      "featured": true,
      "children": [
        {
          "id": "subcat_004",
          "slug": "mens",
          "name": "Men's",
          "icon": "Users",
          "productCount": 260
        },
        {
          "id": "subcat_005",
          "slug": "womens",
          "name": "Women's",
          "icon": "Users",
          "productCount": 260
        }
      ]
    }
  ],
  "message": "Categories retrieved successfully"
}
```

---

### 2. Get Category Details
**Endpoint**: `GET /categories/{categorySlug}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cat_001",
    "slug": "electronics",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image": "https://api.aurashop.com/categories/electronics.jpg",
    "productCount": 245,
    "children": [
      {
        "id": "subcat_001",
        "slug": "phones",
        "name": "Phones",
        "icon": "Smartphone",
        "productCount": 120
      }
    ]
  },
  "message": "Category retrieved successfully"
}
```

---

## Error Handling

### Standard Error Response Format

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "statusCode": 400,
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Authentication required",
  "statusCode": 401,
  "message": "Please provide a valid token"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Access denied",
  "statusCode": 403,
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Resource not found",
  "statusCode": 404,
  "message": "The requested product does not exist"
}
```

**409 Conflict**:
```json
{
  "success": false,
  "error": "Conflict",
  "statusCode": 409,
  "message": "Email already exists"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error",
  "statusCode": 500,
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## Implementation Notes

### For Backend Developer

1. **Database Schema**: Create tables for users, products, categories, cart, orders, reviews, wishlist, addresses
2. **Authentication**: Implement JWT-based authentication with refresh tokens
3. **Validation**: Validate all input data before processing
4. **Security**: Hash passwords, sanitize inputs, use HTTPS
5. **Pagination**: Implement pagination for list endpoints (default limit: 20)
6. **Filtering**: Support filtering by category, subcategory, price range, rating, search
7. **Sorting**: Support sorting by default, price, rating, newest
8. **Image Handling**: Store product and review images securely
9. **Error Handling**: Return appropriate HTTP status codes
10. **Rate Limiting**: Implement rate limiting for public endpoints
11. **CORS**: Configure CORS to allow requests from frontend domain
12. **Logging**: Log all API requests and errors

### For Frontend Developer

1. **API Base URL**: Configure API base URL in environment variables
2. **Token Management**: Store JWT token securely, refresh on expiry
3. **Error Handling**: Handle all error responses gracefully
4. **Loading States**: Show loading indicators during API calls
5. **Caching**: Cache frequently accessed data (products, categories)
6. **Retry Logic**: Implement retry logic for failed requests
7. **Timeout**: Set appropriate request timeouts
8. **Error Messages**: Display user-friendly error messages

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Authentication APIs | 5 | ✓ Defined |
| Product APIs | 3 | ✓ Defined |
| Cart APIs | 6 | ✓ Defined |
| Order APIs | 4 | ✓ Defined |
| User/Account APIs | 7 | ✓ Defined |
| Review APIs | 4 | ✓ Defined |
| Wishlist APIs | 4 | ✓ Defined |
| Category APIs | 2 | ✓ Defined |
| **Total** | **35** | **✓ Complete** |

---

**API Documentation Status**: ✅ **Complete**  
**Last Updated**: April 9, 2026  
**Compatibility**: React 18.3 + TypeScript

All endpoints are fully documented with request/response examples ready for backend implementation.
