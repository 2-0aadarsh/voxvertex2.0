# Enhanced Event Registration - Duplicate Key Error Fix

## 🚨 Problem Description

**Error Message:**
```
E11000 duplicate key error collection: test.enhancedeventregistrations 
index: registrationId_1 dup key: { registrationId: null }
```

**Root Cause:**
- The `EnhancedEventRegistration` model previously had a `registrationId` field with a unique index
- The field was removed from the Mongoose schema (as requested)
- However, the unique index `registrationId_1` still exists in MongoDB
- When creating new registrations without the `registrationId` field, MongoDB treats missing fields as `null`
- Multiple documents with `registrationId: null` violate the unique index constraint

## 🛠️ Solution

### Automated Fix (Recommended)

**For Windows:**
```bash
cd backend
fix-registration-error.bat
```

**For Unix/Linux/Mac:**
```bash
cd backend
./fix-registration-error.sh
```

**Manual execution:**
```bash
cd backend
node fix-duplicate-key-error.js
```

### What the Fix Does

1. **Connects to MongoDB** using your configured connection string
2. **Lists all indexes** on the `enhancedeventregistrations` collection
3. **Identifies the problematic index** `registrationId_1`
4. **Drops the stale index** safely
5. **Verifies the removal** was successful
6. **Reports the results** with detailed logging

### Manual Database Fix (Alternative)

If you prefer to fix this manually using MongoDB Compass or MongoDB Shell:

```javascript
// Connect to your database
use test

// List indexes on the collection
db.enhancedeventregistrations.getIndexes()

// Drop the problematic index
db.enhancedeventregistrations.dropIndex("registrationId_1")

// Verify the index was removed
db.enhancedeventregistrations.getIndexes()
```

## ✅ Expected Results After Fix

### Before Fix:
- ❌ Registration fails with duplicate key error
- ❌ Users cannot register for events
- ❌ Error: `E11000 duplicate key error`

### After Fix:
- ✅ Users can register for multiple different events
- ✅ No more duplicate key errors
- ✅ Registration flow works smoothly
- ✅ Payment integration functions properly

## 🔒 Business Logic Impact

### What's NOT Affected:
- ✅ Users can still register for multiple **different** events
- ✅ All existing registration data is preserved
- ✅ Payment flow remains unchanged
- ✅ Event capacity tracking continues to work

### What's Affected:
- 🚫 Users can now register for the **same event multiple times** (if you want to prevent this, you'll need to add a compound unique index)

## 🛡️ Preventing Future Issues

### Option 1: Allow Multiple Registrations for Same Event
No additional action needed. Current setup allows users to register multiple times for the same event.

### Option 2: Prevent Duplicate Registrations for Same Event
Add this compound unique index to prevent users from registering for the same event twice:

```javascript
// In your EnhancedEventRegistration model or MongoDB shell:
db.enhancedeventregistrations.createIndex(
  { "event": 1, "registrant.userId": 1 }, 
  { unique: true, name: "event_user_unique" }
)
```

## 📊 Monitoring

### Check Registration Success:
```javascript
// Query to check successful registrations
db.enhancedeventregistrations.find({}).count()

// Query to check registrations by user
db.enhancedeventregistrations.find({"registrant.userId": "USER_ID"}).count()

// Query to check registrations for specific event
db.enhancedeventregistrations.find({"event": "EVENT_ID"}).count()
```

## 🔄 Rollback (If Needed)

If you need to restore the original behavior:

```javascript
// Recreate the unique index on registrationId (NOT recommended)
db.enhancedeventregistrations.createIndex(
  { "registrationId": 1 }, 
  { unique: true, name: "registrationId_1" }
)
```

**Note:** This would require adding the `registrationId` field back to your Mongoose schema and implementing the ID generation logic.

## 📝 Technical Details

### Files Modified:
- `backend/fix-duplicate-key-error.js` - Main fix script
- `backend/fix-registration-error.bat` - Windows batch file
- `backend/fix-registration-error.sh` - Unix shell script
- `backend/DUPLICATE_KEY_ERROR_FIX.md` - This documentation

### Database Changes:
- **Removed:** `registrationId_1` unique index
- **Preserved:** All existing registration documents
- **Preserved:** All other indexes (including `_id` unique index)

### No Code Changes Required:
- ✅ Frontend registration flow remains unchanged
- ✅ Backend API endpoints remain unchanged
- ✅ Payment integration remains unchanged
- ✅ Database schema remains unchanged

## 🚀 Next Steps

1. **Run the fix script** using one of the methods above
2. **Test registration** for a new event
3. **Verify payment flow** works end-to-end
4. **Monitor for any issues** in the logs
5. **Consider adding compound index** if you want to prevent duplicate registrations for the same event

## 📞 Support

If you encounter any issues with this fix:

1. Check the console output for detailed error messages
2. Verify your MongoDB connection string in `.env`
3. Ensure MongoDB is running and accessible
4. Check database permissions
5. Review the detailed logs in the fix script output

---

**Fix Status:** ✅ Ready to execute
**Risk Level:** 🟢 Low (only removes problematic index)
**Impact:** 🎯 Resolves registration blocking issue
