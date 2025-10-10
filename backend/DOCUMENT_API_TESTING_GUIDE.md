# Document Management API Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Document Management API endpoints. All endpoints require authentication via JWT token.

## Base URL
```
http://localhost:3001/api/documents
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Upload Document
**POST** `/upload`

**Description:** Upload a new document (PDF, DOC, DOCX only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
documentName: "Contract for AI Summit 2024"
documentType: "Contract"
tags: "ai,summit,2024" (optional)
notes: "Initial contract draft" (optional)
file: [PDF/DOC/DOCX file] (required)
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "document_id",
    "documentName": "Contract for AI Summit 2024",
    "documentType": "Contract",
    "file": {
      "originalName": "contract.pdf",
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "size": 245760
    },
    "organizer": "organizer_id",
    "direction": "outgoing",
    "status": "uploaded",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Confirmed Speakers
**GET** `/api/book-speaker/organizer-bookings`

**Description:** Get list of confirmed speakers for assignment (use existing booking endpoint)

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "inProgress": [...],
    "confirmed": [
      {
        "_id": "booking_id",
        "bookingId": "BK-00001",
        "speaker": {
          "_id": "speaker_id",
          "firstName": "Dr. Sarah",
          "lastName": "Chen",
          "email": "sarah.chen@email.com",
          "profileImageUrl": "https://...",
          "expertise": "AI, Machine Learning"
        },
        "eventDetails": {
          "name": "AI Summit 2024",
          "type": "Conference",
          "location": "San Francisco",
          "expectedAttendees": 500
        },
        "status": "accepted"
      }
    ],
    "declined": []
  },
  "stats": {
    "total": 5,
    "inProgress": 2,
    "confirmed": 3,
    "declined": 0
  }
}
```

### 3. Assign Document to Speaker
**POST** `/:documentId/assign`

**Description:** Assign an uploaded document to a speaker

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "speakerId": "speaker_id",
  "relatedBookingId": "booking_id" (optional)
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document assigned to speaker successfully",
  "data": {
    "_id": "document_id",
    "status": "assigned",
    "speaker": {
      "_id": "speaker_id",
      "firstName": "Dr. Sarah",
      "lastName": "Chen"
    },
    "assignedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### 4. Send Document to Speaker
**POST** `/:documentId/send`

**Description:** Send assigned document to speaker

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document sent to speaker successfully",
  "data": {
    "_id": "document_id",
    "status": "sent",
    "sentAt": "2024-01-15T10:40:00.000Z"
  }
}
```

### 5. Get Organizer Documents
**GET** `/organizer`

**Description:** Get organizer's documents with optional filtering

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `direction`: "outgoing" | "incoming" (optional)
- `status`: "uploaded" | "assigned" | "sent" | "pending_review" | "approved" | "signed" | "declined" (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Example:** `/organizer?direction=outgoing&status=assigned&page=1&limit=5`

**Expected Response:**
```json
{
  "success": true,
  "message": "Organizer documents fetched successfully",
  "data": [
    {
      "_id": "document_id",
      "documentName": "Contract for AI Summit 2024",
      "documentType": "Contract",
      "status": "assigned",
      "speaker": {
        "_id": "speaker_id",
        "firstName": "Dr. Sarah",
        "lastName": "Chen"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### 6. Get Speaker Documents
**GET** `/speaker`

**Description:** Get speaker's documents

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** Same as organizer documents

**Expected Response:** Similar to organizer documents but from speaker's perspective

### 7. Update Document Status
**PUT** `/:documentId/status`

**Description:** Update document status (organizer or speaker)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved" // or other valid status
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document status updated successfully",
  "data": {
    "_id": "document_id",
    "status": "approved",
    "approvedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 8. Download Document
**GET** `/:documentId/download`

**Description:** Get download URL and track download

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document download processed successfully",
  "data": {
    "document": {
      "_id": "document_id",
      "documentName": "Contract for AI Summit 2024"
    },
    "downloadUrl": "https://res.cloudinary.com/..."
  }
}
```

### 9. Get Document Statistics
**GET** `/organizer/stats` or `/speaker/stats`

**Description:** Get document statistics

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document statistics fetched successfully",
  "data": {
    "total": 10,
    "uploaded": 2,
    "assigned": 3,
    "sent": 2,
    "pendingReview": 1,
    "approved": 2,
    "signed": 0,
    "declined": 0
  }
}
```

### 10. Search Documents
**GET** `/search`

**Description:** Search documents with filters

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `query`: search term (optional)
- `documentType`: "MOU" | "Contract" | "Invoice" | "Agreement" (optional)
- `status`: document status (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Example:** `/search?query=contract&documentType=Contract&status=approved`

### 11. Get Single Document
**GET** `/:documentId`

**Description:** Get single document by ID

**Headers:**
```
Authorization: Bearer <token>
```

### 12. Delete Document
**DELETE** `/:documentId`

**Description:** Delete document (organizer only)

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Using Existing Booking Endpoint

### Get Confirmed Speakers
**GET** `/api/book-speaker/organizer-bookings`

**Description:** Use the existing booking endpoint to get confirmed speakers for document assignment

**Headers:**
```
Authorization: Bearer <token>
```

**Usage:** 
- Call this endpoint to get all organizer bookings
- Extract speakers from the `data.confirmed` array
- Use the `speaker._id` for document assignment

## Testing Workflow

### Complete Document Flow Test:

1. **Upload Document**
   - POST `/upload` with file and metadata
   - Verify status: "uploaded"

2. **Get Confirmed Speakers**
   - GET `/api/book-speaker/organizer-bookings`
   - Note a speaker ID from the "confirmed" array for assignment

3. **Assign Document**
   - POST `/:documentId/assign` with speaker ID
   - Verify status: "assigned"

4. **Send Document**
   - POST `/:documentId/send`
   - Verify status: "sent"

5. **Speaker Reviews Document**
   - Switch to speaker account
   - GET `/speaker` to see incoming documents
   - PUT `/:documentId/status` with "approved"

6. **Verify Status Updates**
   - Switch back to organizer account
   - GET `/organizer` to see updated status

## Error Responses

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Document name, type, and file are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Unauthorized: You can only assign your own documents"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Document not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to upload document",
  "error": "Detailed error message in development"
}
```

## File Upload Constraints

- **Allowed file types:** PDF, DOC, DOCX only
- **Maximum file size:** 10MB
- **Required fields:** documentName, documentType, file
- **Optional fields:** tags, notes

## Status Flow

```
uploaded → assigned → sent → pending_review → approved/signed/declined
```

## Postman Collection Setup

1. Create a new Postman collection: "Document Management API"
2. Set collection variables:
   - `baseUrl`: `http://localhost:3001/api/documents`
   - `token`: Your JWT token
3. Add Authorization header to all requests:
   - Type: Bearer Token
   - Token: `{{token}}`
4. Test each endpoint following the workflow above

## Notes

- All timestamps are in ISO 8601 format
- File sizes are in bytes
- Pagination starts from page 1
- Default limit is 10 items per page
- Cloudinary URLs are returned for file access
- Download tracking is automatic when using download endpoint
