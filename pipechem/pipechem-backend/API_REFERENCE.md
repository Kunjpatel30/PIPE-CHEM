# PIPE CHEM — Backend API Reference

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require a **JWT Bearer Token** in the Authorization header:
```
Authorization: Bearer <your_token>
```
Tokens are returned on login/register.

---

## 🔐 Auth Endpoints

### Register (User)
```
POST /api/auth/register
```
**Body:**
```json
{
  "name":     "John Doe",
  "email":    "john@company.com",
  "phone":    "+91 9876543210",
  "company":  "ABC Industries",
  "password": "mypassword123"
}
```
**Returns:** `{ token, user }`

---

### Login (User)
```
POST /api/auth/login
```
**Body:**
```json
{ "email": "john@company.com", "password": "mypassword123" }
```
**Returns:** `{ token, user }`

---

### Login (Admin)
```
POST /api/auth/admin/login
```
**Body:**
```json
{ "username": "admin", "password": "pipechem@2024" }
```
**Returns:** `{ token }`

---

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <user_token>
```

---

## 📋 Inquiry Endpoints

### Submit Inquiry (User - requires login)
```
POST /api/inquiries
Authorization: Bearer <user_token>
```
**Body:**
```json
{
  "chemical":      "Hydrochloric Acid (HCl) 30-32%",
  "quantity":      "5 MT",
  "expectedPrice": "₹12,000/MT",
  "deliveryType":  "Ex-Plant",
  "location":      "",
  "remarks":       "Monthly requirement"
}
```

---

### Get All Inquiries (Admin)
```
GET /api/inquiries?status=Pending&chemical=HCl&search=john
Authorization: Bearer <admin_token>
```

---

### Get My Inquiries (User)
```
GET /api/inquiries/mine
Authorization: Bearer <user_token>
```

---

### Update Inquiry Status (Admin)
```
PUT /api/inquiries/:id/status
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "status":    "Resolved",
  "adminNote": "Quotation: ₹11,500/MT. Ex-Plant, GNFC Bharuch.",
  "notifType": "approval"
}
```
`notifType` options: `inquiry_update`, `approval`, `appointment`, `rejection`

---

### Delete Inquiry (Admin)
```
DELETE /api/inquiries/:id
Authorization: Bearer <admin_token>
```

---

## 📅 Appointment Endpoints

### Schedule Appointment (Admin)
```
POST /api/appointments
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "customer": "John Doe",
  "phone":    "+91 9876543210",
  "datetime": "2024-12-20T10:30",
  "purpose":  "Product pricing discussion",
  "note":     "Bring company GST certificate"
}
```

---

### Get All Appointments (Admin)
```
GET /api/appointments?status=Scheduled
Authorization: Bearer <admin_token>
```

---

### Get My Appointments (User)
```
GET /api/appointments/mine
Authorization: Bearer <user_token>
```

---

### Update Appointment Status (Admin)
```
PUT /api/appointments/:id/status
Authorization: Bearer <admin_token>
```
**Body:** `{ "status": "Completed" }`
Status options: `Scheduled`, `Completed`, `Cancelled`

---

### Delete Appointment (Admin)
```
DELETE /api/appointments/:id
Authorization: Bearer <admin_token>
```

---

## 👥 User Management (Admin)

### Get All Users
```
GET /api/users?search=john&status=Active
Authorization: Bearer <admin_token>
```

### Get Single User (with inquiry & appointment history)
```
GET /api/users/:id
Authorization: Bearer <admin_token>
```

### Block/Unblock User
```
PUT /api/users/:id/block
Authorization: Bearer <admin_token>
Body: { "blocked": true }
```

### Delete User
```
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

---

## 🔔 Notification Endpoints

### Get User Notifications
```
GET /api/notifications/user
Authorization: Bearer <user_token>
```

### Mark Notification as Read (User)
```
PUT /api/notifications/user/:id/read
Authorization: Bearer <user_token>
```

### Mark All Notifications Read (User)
```
PUT /api/notifications/user/read-all
Authorization: Bearer <user_token>
```

### Get Admin Notifications
```
GET /api/notifications/admin
Authorization: Bearer <admin_token>
```

### Mark All Admin Notifications Read
```
PUT /api/notifications/admin/read-all
Authorization: Bearer <admin_token>
```

### Send Manual Notification to User (Admin)
```
POST /api/notifications/admin/send
Authorization: Bearer <admin_token>
Body: { "userId": "PC...", "type": "general", "title": "Hello!", "body": "Your message" }
```

---

## 📊 Reports (Admin)

### Get Summary Report
```
GET /api/reports/summary
Authorization: Bearer <admin_token>
```

### Export Inquiries as CSV
```
GET /api/reports/export/csv
Authorization: Bearer <admin_token>
```
(Downloads a CSV file)

---

## 📬 Contact Messages

### Submit Contact Message (Public)
```
POST /api/contact
Body: { "name": "...", "email": "...", "phone": "...", "subject": "...", "message": "..." }
```

### Get All Contact Messages (Admin)
```
GET /api/contact
Authorization: Bearer <admin_token>
```

### Mark Message as Read (Admin)
```
PUT /api/contact/:id/read
Authorization: Bearer <admin_token>
```

---

## ❤️ Health Check
```
GET /api/health
```

---

## 🚀 Setup Instructions

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install Dependencies
```bash
cd pipechem-backend
npm install
```

### 3. Configure Environment
```bash
copy .env.example .env
# Edit .env if needed (default settings work out of the box)
```

### 4. Start the Server
```bash
npm start
```
Or for development with auto-restart:
```bash
npm run dev
```

### 5. Test the API
Open browser and go to: `http://localhost:5000/api/health`
You should see: `{ "success": true, "status": "PIPE CHEM API is running" }`

---

## 📝 Notes

- **Database**: SQLite (`pipechem.db`) is created automatically on first run
- **Admin credentials**: `admin` / `pipechem@2024`
- **Token expiry**: User tokens expire in 7 days, Admin tokens in 12 hours
- **Production**: Set `JWT_SECRET` to a secure random string and restrict `FRONTEND_URL` to your domain
