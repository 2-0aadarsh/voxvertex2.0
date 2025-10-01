# Saved Speaker API Documentation

## Overview
This API provides functionality for organizers to save speakers with custom tags for future reference, similar to Instagram's save functionality. Saved speakers appear in the "Speaker Database" with their custom tags merged into the `areaOfExpertise` field.

## Authentication
All endpoints require JWT authentication and are restricted to users with the "Organizer" role.

## Base URL
```
/api/saved-speakers
```

## Endpoints

### 1. Save a Speaker with Tags
**POST** `/api/saved-speakers`

Save a speaker with custom tags for the current organizer.

**Request Body:**
```json
{
  "speakerId": "string (required)",
  "customTags": ["string"] (optional, max 10 tags, each max 50 chars),
  "notes": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Speaker saved successfully",
  "data": {
    "_id": "savedSpeakerId",
    "organizer": "organizerId",
    "speaker": {
      "_id": "speakerId",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profileImageUrl": "https://...",
      "bio": "Speaker bio...",
      "professionalTitle": "CEO",
      "location": "New York",
      "areaOfExpertise": ["Technology", "Leadership"],
      "yearsOfExperience": 10,
      "roleSpecificData": {...},
      "isProfileComplete": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "customTags": ["Tech Expert", "Leadership"],
    "notes": "Great for corporate events",
    "savedAt": "2024-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

### 2. Get All Saved Speakers
**GET** `/api/saved-speakers`

Get all saved speakers for the current organizer with pagination and optional tag filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `tags` (optional): Filter by custom tags (can be array or single string)

**Response:**
```json
{
  "success": true,
  "message": "Saved speakers retrieved successfully",
  "data": {
    "savedSpeakers": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Check Speaker Saved Status
**GET** `/api/saved-speakers/check/:speakerId`

Check if a specific speaker is saved by the current organizer.

**Response:**
```json
{
  "success": true,
  "message": "Speaker saved status retrieved successfully",
  "data": {
    "isSaved": true,
    "savedSpeaker": {
      "_id": "savedSpeakerId",
      "customTags": ["Tech Expert"],
      "notes": "Great speaker",
      "savedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Update Saved Speaker Tags
**PUT** `/api/saved-speakers/:savedSpeakerId`

Update custom tags and notes for a saved speaker.

**Request Body:**
```json
{
  "customTags": ["string"] (optional, max 10 tags),
  "notes": "string" (optional, max 500 chars)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tags updated successfully",
  "data": {
    "_id": "savedSpeakerId",
    "customTags": ["Updated Tag 1", "Updated Tag 2"],
    "notes": "Updated notes",
    "speaker": {...}
  }
}
```

### 5. Remove Saved Speaker
**DELETE** `/api/saved-speakers/:savedSpeakerId`

Remove a saved speaker (soft delete - sets `isActive` to false).

**Response:**
```json
{
  "success": true,
  "message": "Speaker removed from saved list successfully"
}
```

### 6. Get Custom Tags
**GET** `/api/saved-speakers/tags`

Get all unique custom tags for the current organizer.

**Response:**
```json
{
  "success": true,
  "message": "Custom tags retrieved successfully",
  "data": {
    "customTags": ["Tech Expert", "Leadership", "Corporate"],
    "count": 3
  }
}
```

## Enhanced Speaker Search Endpoints

### 7. Get Saved Speakers for Database View
**GET** `/api/speaker-search/saved`

Get saved speakers formatted for the Speaker Database view with custom tags merged into `areaOfExpertise`.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `tags` (optional): Filter by custom tags

**Response:**
```json
{
  "success": true,
  "message": "Saved speakers for database retrieved successfully",
  "data": {
    "speakers": [
      {
        "_id": "speakerId",
        "firstName": "John",
        "lastName": "Doe",
        "areaOfExpertise": ["Technology", "Leadership", "Tech Expert", "Corporate"],
        "originalAreaOfExpertise": ["Technology", "Leadership"],
        "customTags": ["Tech Expert", "Corporate"],
        "savedAt": "2024-01-01T00:00:00.000Z",
        "notes": "Great for corporate events",
        "savedSpeakerId": "savedSpeakerId",
        ...other speaker fields
      }
    ],
    "pagination": {...}
  }
}
```

### 8. Get Saved Speakers with Tags
**GET** `/api/speaker-search/saved-with-tags`

Get saved speakers with their custom tags for tag management.

**Response:**
```json
{
  "success": true,
  "message": "Saved speakers with tags retrieved successfully",
  "data": {
    "savedSpeakers": [...],
    "customTags": ["Tech Expert", "Leadership", "Corporate"],
    "pagination": {...}
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Speaker ID is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Organizer role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Speaker not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Speaker is already saved"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error while saving speaker",
  "error": "Detailed error message"
}
```

## Database Schema

### SavedSpeaker Model
```javascript
{
  organizer: ObjectId (ref: EnhancedUser, required),
  speaker: ObjectId (ref: EnhancedUser, required),
  customTags: [String] (max 10, each max 50 chars),
  savedAt: Date (default: Date.now),
  notes: String (max 500 chars),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- Compound unique index: `{ organizer: 1, speaker: 1 }`
- Performance indexes: `{ organizer: 1, isActive: 1 }`, `{ speaker: 1, isActive: 1 }`

## Usage Examples

### Save a Speaker
```javascript
const response = await fetch('/api/saved-speakers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    speakerId: '64a1b2c3d4e5f6789012345',
    customTags: ['Tech Expert', 'Corporate Speaker'],
    notes: 'Great for technology conferences'
  })
});
```

### Get Saved Speakers for Database
```javascript
const response = await fetch('/api/speaker-search/saved?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

### Filter by Tags
```javascript
const response = await fetch('/api/saved-speakers?tags=Tech Expert', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

## Notes

1. **Duplicate Prevention**: The system prevents duplicate saves using a compound unique index on `organizer` and `speaker`.

2. **Soft Delete**: Removing a saved speaker sets `isActive` to false instead of deleting the record.

3. **Tag Merging**: In the database view, custom tags are merged with the speaker's original `areaOfExpertise` to create a unified expertise display.

4. **Validation**: Custom tags are limited to 10 per speaker, with each tag max 50 characters. Notes are limited to 500 characters.

5. **Authentication**: All endpoints require JWT authentication and organizer role authorization.

