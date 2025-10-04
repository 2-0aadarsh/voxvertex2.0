# Enhanced Event Registration API Documentation

## Overview
This document describes the enhanced event registration system that integrates with the existing enhanced events functionality. The system handles ticket quantity management, user validation, and payment processing for enhanced events.

## Key Features
- ✅ **Ticket Quantity Management** - Automatically decreases available tickets when users register
- ✅ **User Validation** - Primary registrant must be in database, additional participants are optional
- ✅ **Payment Integration** - Supports Razorpay, wallet payments, and free events
- ✅ **Transaction Safety** - Uses MongoDB transactions to ensure data consistency
- ✅ **Rollback Mechanism** - Restores ticket quantities if payment fails

## API Endpoints

### 1. Register for Enhanced Event
**POST** `/api/enhanced-events/:eventId/register`

**⚠️ Requires Authentication**: JWT token in Authorization header

Creates a new registration for an enhanced event with automatic ticket quantity management.

#### Request Body
```json
{
  "ticketTierId": "ticket_tier_object_id",
  "registrant": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "additionalParticipants": [
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567891"
    }
  ]
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Registration created successfully. Proceed to payment.",
  "data": {
    "registrationId": "registration_object_id",
    "registrationNumber": "REGabc123def456",
    "totalAmount": 5697,
    "currency": "INR",
    "totalParticipants": 3,
    "ticketTier": "Premium Pass",
    "paymentOrder": {
      "id": "order_id",
      "amount": 569700,
      "currency": "INR"
    }
  }
}
```

### 2. Create Payment Order
**POST** `/api/enhanced-events/registrations/:registrationId/create-payment`

Creates a payment order for the registration.

#### Request Body
```json
{
  "paymentMethodId": "payment_method_id"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "registrationId": "registration_object_id",
    "registrationNumber": "REGabc123def456",
    "orderId": "order_id",
    "amount": 569700,
    "currency": "INR",
    "keyId": "rzp_test_key"
  }
}
```

### 3. Verify Payment
**POST** `/api/enhanced-events/registrations/:registrationId/verify-payment`

Verifies payment completion and confirms registration.

#### Request Body
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "registrationId": "registration_object_id",
    "registrationNumber": "REGabc123def456",
    "paymentStatus": "paid"
  }
}
```

### 4. Get Registration Summary
**GET** `/api/enhanced-events/registrations/:registrationId/summary`

Retrieves complete registration details.

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "summary": {
      "registrationId": "registration_object_id",
      "registrationNumber": "REGabc123def456",
      "event": {
        "name": "AI & Machine Learning Summit 2025",
        "description": "Join industry leaders...",
        "startDate": "2025-09-16T00:00:00.000Z",
        "endDate": "2025-09-16T00:00:00.000Z",
        "mode": "hybrid",
        "location": "Mumbai, India",
        "eventUrl": "https://event-url.com",
        "bannerImage": "banner_image_url"
      },
      "ticketTier": {
        "name": "Premium Pass",
        "price": 1899,
        "quantityBooked": 3
      },
      "registrant": {
        "userId": "user_object_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "additionalParticipants": [
        {
          "userId": null,
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "+1234567891",
          "isRegisteredUser": false
        }
      ],
      "totalAmount": 5697,
      "currency": "INR",
      "paymentStatus": "paid",
      "registrationDate": "2025-01-20T10:30:00.000Z",
      "confirmationSent": true
    }
  }
}
```

### 5. Get Event Participants (Organizers Only)
**GET** `/api/enhanced-events/:eventId/participants`

Retrieves all confirmed participants for an event.

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "registrationId": "REGabc123def456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "userId": "user_object_id",
        "isPrimaryRegistrant": true,
        "ticketTier": "Premium Pass",
        "registrationDate": "2025-01-20T10:30:00.000Z"
      }
    ],
    "totalParticipants": 1,
    "totalRegistrations": 1
  }
}
```

### 6. Get User's Registrations
**GET** `/api/enhanced-events/user/registrations`

Retrieves all registrations for the current authenticated user.

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "registration_object_id",
        "registrationId": "REGabc123def456",
        "event": {
          "_id": "event_object_id",
          "eventName": "AI & Machine Learning Summit 2025",
          "startDate": "2025-09-16T00:00:00.000Z",
          "endDate": "2025-09-16T00:00:00.000Z",
          "location": "Mumbai, India",
          "eventMode": "hybrid",
          "bannerImage": "banner_image_url"
        },
        "ticketTier": {
          "name": "Premium Pass",
          "price": 1899,
          "quantityBooked": 3
        },
        "totalAmount": 5697,
        "paymentStatus": "paid",
        "registrationDate": "2025-01-20T10:30:00.000Z"
      }
    ],
    "totalRegistrations": 1
  }
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Not enough tickets available",
  "available": 5,
  "requested": 10,
  "ticketTier": "Premium Pass"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Enhanced event not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Registration failed",
  "error": "Detailed error message"
}
```

## Database Models

### EnhancedEventRegistration
```javascript
{
  event: ObjectId, // Reference to EnhancedEvent
  ticketTier: {
    tierId: ObjectId, // Reference to ticket tier in event
    name: String,
    price: Number,
    quantityBooked: Number
  },
  registrant: {
    userId: ObjectId, // Reference to EnhancedUser (required)
    name: String,
    email: String,
    phone: String
  },
  additionalParticipants: [{
    userId: ObjectId, // Reference to EnhancedUser (optional)
    name: String,
    email: String,
    phone: String,
    isRegisteredUser: Boolean
  }],
  totalAmount: Number,
  currency: String,
  paymentStatus: String, // "pending", "initiated", "paid", "failed", "refunded"
  paymentProvider: String, // "razorpay", "wallet", "free"
  registrationId: String, // Unique registration number
  status: String // "active", "cancelled", "refunded"
}
```

## Key Business Logic

### Ticket Quantity Management
1. **Reservation**: When registration is created, ticket quantity is immediately decreased
2. **Rollback**: If payment fails, quantity is automatically restored
3. **Validation**: System checks availability before allowing registration

### User Validation
1. **Primary Registrant**: Must exist in EnhancedUser database
2. **Additional Participants**: May or may not exist in database
3. **Flexible Registration**: Supports both registered and guest participants

### Payment Flow
1. **Free Events**: Automatically confirmed if totalAmount = 0
2. **Paid Events**: Creates payment order and waits for verification
3. **Multiple Methods**: Supports Razorpay, wallet, and future payment methods

## Security Features
- ✅ **Authentication**: Required for user-specific endpoints
- ✅ **Authorization**: Role-based access for organizer endpoints
- ✅ **Transaction Safety**: MongoDB transactions prevent data inconsistency
- ✅ **Payment Verification**: Cryptographic signature verification for Razorpay
- ✅ **Input Validation**: Comprehensive validation of all input data

## Integration Points
- **Enhanced Events**: Uses existing enhanced event model and data
- **Payment Service**: Reuses existing payment service infrastructure
- **Email Service**: Uses existing confirmation email service
- **User Management**: Integrates with existing EnhancedUser model

## Testing Recommendations
1. Test ticket quantity management with concurrent registrations
2. Verify payment rollback functionality
3. Test user validation for both registered and guest users
4. Validate error handling for various failure scenarios
5. Test organizer participant management features
