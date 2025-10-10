# Voxvertex Marketplace - Full Stack Application

## 🏗️ **Project Structure**

This repository now contains a **complete full-stack application** with:

- **Frontend**: Next.js 15 with React 19 (Marketplace Website)
- **Backend**: Node.js/Express with Enhanced Dispute Resolution System

```
📁 Voxvertex-Marketplace-Website/
├── 📁 src/                    # Next.js frontend
├── 📁 backend/                # Node.js backend
│   ├── 📁 src/
│   │   ├── 📁 models/
│   │   │   ├── dispute.js     # ✨ NEW: Dispute Resolution Model
│   │   │   ├── user.js        # Original user model
│   │   │   ├── event.js       # Original event model
│   │   │   └── ... (other original models)
│   │   ├── 📁 controllers/
│   │   │   ├── disputeController.js  # ✨ NEW: Dispute Management
│   │   │   └── ... (original controllers)
│   │   ├── 📁 routes/
│   │   │   ├── disputeRoutes.js      # ✨ NEW: Dispute API Routes
│   │   │   └── ... (original routes)
│   │   └── index.js           # Enhanced server with dispute integration
│   └── package.json
├── package.json               # Enhanced with backend scripts
└── README-INTEGRATION.md      # This file
```

## 🚀 **Getting Started**

### **1. Install Dependencies**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
npm run install:backend
```

### **2. Setup Environment Variables**

Create `.env` file in the `/backend` directory:
```env
# Database
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret

# Payment (Optional for dispute system)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Optional for notifications)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### **3. Run the Application**

#### **Option A: Run Full Stack (Recommended)**
```bash
npm run dev:full
```
This runs:
- **Backend**: http://localhost:3000 
- **Frontend**: http://localhost:3001

#### **Option B: Run Separately**
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend  
npm run dev
```

## 🛡️ **Dispute Resolution System**

### **✅ What's Been Added:**

#### **Complete 3-Stage Dispute Workflow:**
1. **Stage 1: Peer-to-Peer Resolution** 
   - Private chat between disputing parties
   - Evidence sharing and negotiation
   - Option to mark as resolved or escalate

2. **Stage 2: Platform Mediation**
   - Neutral mediator joins the conversation
   - Facilitated resolution process
   - Option to accept resolution or escalate further

3. **Stage 3: Legal Proceedings**
   - Chat locked for evidence integrity
   - Document export for legal proceedings
   - Formal conclusion of platform involvement

#### **Intelligent Filing System:**
- **Step 1**: Select event from user's event history
- **Step 2**: Choose party type (Speaker/Participant/Organizer)  
- **Step 3**: Select specific person involved
- **Step 4**: Provide dispute details and submit

#### **Automatic Features:**
- Unique case number generation (VVS-YYYYMM-0001)
- Role-based access control
- Conversation logging and history
- Stage progression tracking
- Evidence and offer management

### **🔗 API Endpoints Added:**

```javascript
GET    /api/disputes/                          # Get user's disputes
GET    /api/disputes/stats                     # Admin statistics
GET    /api/disputes/filing/events             # Step 1: Events for filing
GET    /api/disputes/filing/events/:id/parties # Step 2&3: Get parties
POST   /api/disputes/file                      # Step 4: File dispute
GET    /api/disputes/:id                       # Get dispute details
POST   /api/disputes/:id/messages              # Add message to conversation
POST   /api/disputes/:id/escalate-mediation    # Stage 1 → 2
POST   /api/disputes/:id/assign-mediator       # Assign mediator (Stage 2)
POST   /api/disputes/:id/escalate-legal        # Stage 2 → 3  
POST   /api/disputes/:id/resolve               # Resolve dispute
```

## 📁 **Original Backend Features (Preserved)**

✅ **All original functionality remains intact:**

- User Authentication & Role Management
- Event Management System
- Posts, Comments, and Social Features  
- Real-time Messaging with Socket.IO
- Speaker Profile Management
- Availability System
- Wallet/Payment Integration
- Search Functionality
- All existing API endpoints work unchanged

## 🎯 **Integration Status**

### **✅ Completed:**
- [x] Dispute Resolution System backend
- [x] Enhanced backend integrated with frontend repo
- [x] All original features preserved
- [x] Development scripts setup
- [x] Project structure organized

### **🚧 Next Steps (To be developed):**
- [ ] Frontend dispute management UI
- [ ] Real-time dispute chat interface  
- [ ] Admin mediation dashboard
- [ ] Integration with existing user system
- [ ] Notification system for dispute updates

## 🛠️ **Development Workflow**

### **Adding New Features:**
1. **Backend**: Add to `/backend/src/` following existing patterns
2. **Frontend**: Add to `/src/` using Next.js 15 conventions
3. **Integration**: Use fetch/axios to connect frontend to backend APIs

### **File Structure Guidelines:**
- **Models**: `/backend/src/models/`
- **Controllers**: `/backend/src/controllers/`  
- **Routes**: `/backend/src/routes/`
- **Frontend Components**: `/src/components/`
- **Frontend Pages**: `/src/app/`

## 🔧 **Technical Stack**

### **Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- Passport.js for authentication
- Multer for file uploads
- Razorpay for payments

### **Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

## 🤝 **Contributing**

1. Keep backend and frontend code separate but coordinated
2. Follow existing patterns and conventions
3. Test both frontend and backend when making changes
4. Update this README when adding new major features

---

## 📞 **Support**

The dispute resolution system is built according to the specifications in your documentation and ready for frontend integration. All original backend functionality is preserved and enhanced with the new dispute management capabilities.
