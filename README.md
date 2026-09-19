# CivicReport - Online Complaint Registration and Management System

A full-stack, responsive municipal grievance registration and tracking web application built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, and **JavaScript (React 18 & Bootstrap 5)**.

---

## 📌 Project Overview

CivicReport allows citizens to report civic infrastructure issues directly to local municipal authorities, monitor real-time resolution progress via a visual status timeline, and view detailed inspection remarks. Administrative staff and field officers have dedicated management dashboards to triage, assign, update, and resolve civic complaints.

### Supported Complaint Categories:
1. 💡 **Street Light Problems** (Faulty poles, flickering fixtures, power cable hazards)
2. 💧 **Water Pipe Leakage** (Pipeline ruptures, contaminated water, low pressure)
3. 🌧️ **Rain Water Drainage** (Clogged storm drains, flooded roadways, open manholes)
4. 🧹 **Roadside Cleaning** (Waste accumulation, overflowing bins, road sweeping)

---

## 🚀 Key Features

### 1. Citizen Portal
* **Registration & Login**: Secure registration with password hashing (`bcryptjs`) and JWT session management.
* **Register Complaints**: Clean form with category selection, title, detailed description, location, landmark, and photo evidence upload (`Multer`).
* **Unique Complaint ID Generation**: Auto-generated sequential tracking ID (e.g., `CMP-2026-0001`).
* **Visual Status Timeline**: Interactive progression tracker (`Submitted → Assigned → In Progress → Resolved → Closed`).
* **My Complaints**: Filter by category, filter by status, search by keyword, and inspect full complaint details.
* **Public Tracking**: Any citizen can track complaint progress with just the Complaint ID without logging in.

### 2. Field Staff Portal
* View complaints assigned specifically to the logged-in technician.
* Update status (`In Progress`, `Resolved`) with mandatory action remarks.
* Access citizen contact information and exact incident location for field visits.

### 3. Administrator Dashboard
* **Real-time Analytics**: Interactive Chart.js graphs displaying complaints by category and resolution status.
* **Metric Cards**: Total citizens, total complaints, pending, assigned, in-progress, resolved, and closed.
* **Complaint Triage & Assignment**: Assign complaints to authorized field staff with custom instructions.
* **Status Override & Deletion**: Update status or delete invalid/duplicate complaints with automatic audit log cleanup.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (React 18 via Babel Standalone), Bootstrap 5, Bootstrap Icons, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs for password encryption |
| **File Uploads** | Multer (5MB limit, JPG/PNG/WEBP validation) |
| **Input Validation** | express-validator |

---

## 📁 Folder Structure

```
Online Complaint System/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   ├── adminController.js
│   │   │   └── staffController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── staffRoutes.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Complaint.js
│   │   │   ├── Staff.js
│   │   │   └── ComplaintUpdate.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   └── validatorMiddleware.js
│   │   ├── db/
│   │   │   ├── connection.js
│   │   │   └── seed.js
│   │   └── utils/
│   │       ├── generateComplaintId.js
│   │       └── apiResponse.js
│   ├── uploads/               # Stored complaint photos
│   ├── app.js                 # Express server configuration
│   ├── package.json           # Dependencies & run scripts
│   ├── .env                   # Environment variables
│   └── .env.example
├── database/
│   ├── mongodb_setup.js       # MongoDB collection & index setup
│   └── schema.mongodb.js     # MongoDB Schema validation & Playground script
├── frontend/
│   ├── index.html             # Public Landing Page
│   ├── login.html             # Login Page (with 1-click Demo Fill)
│   ├── register.html          # Citizen Registration
│   ├── dashboard.html         # Citizen Dashboard
│   ├── complaint.html         # Complaint Submission Form
│   ├── my-complaints.html     # My Complaints Table & Filters
│   ├── track-complaint.html   # Live Visual Timeline Tracking
│   ├── admin.html             # Administrator Analytics & Management
│   ├── staff.html             # Field Staff Portal
│   ├── css/
│   │   └── style.css          # Custom Civic Service Theme
│   └── jsx/
│       ├── common.js
│       ├── login.js
│       ├── register.js
│       ├── dashboard.js
│       ├── complaint.js
│       ├── complaints.js
│       ├── track.js
│       ├── admin.js
│       └── staff.js
├── postman_collection.json    # Ready-to-import Postman API tests
└── README.md
```

---

## ⚡ How to Open and Run in VS Code

### Step 1: Open in VS Code
Open VS Code, press `Ctrl + O` (or **File > Open Folder**), and select:
```
C:\Users\HP\OneDrive\Desktop\civic report\Online Complaint System
```
*(or `C:\Users\HP\Desktop\civic report\Online Complaint System`)*

### Step 2: Ensure MongoDB is Running
MongoDB is already installed and running as a Windows service on your machine.
If you ever need to verify or start it manually in PowerShell:
```powershell
Get-Service -Name MongoDB
```

### Step 3: Install Backend Dependencies
Open the VS Code integrated terminal (`Ctrl + ~`) and run:
```powershell
cd backend
npm.cmd install
```

### Step 4: Seed Initial Data
Seed the sample admin, staff, and complaints into your MongoDB:
```powershell
npm.cmd run seed
```

### Step 5: Start the Backend Server
```powershell
npm.cmd start
```
The server will start and log:
```
===================================================
🚀 Online Complaint System Backend Server Started!
📡 Server Port: 3000
🌐 Application URL: http://localhost:3000
📁 Static Frontend served from ../frontend
===================================================
```

### Step 6: Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```
*Note: The Express backend serves the complete frontend automatically! You do not need to run a separate frontend server.*

---

## 🔑 Pre-Configured Demo Credentials

For rapid testing, demo buttons are provided on `login.html` to fill credentials with a single click:

| Role | Email | Password | Access / Dashboard |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `Admin@123` | `admin.html` (Full Analytics & Management) |
| **Field Staff** | `staff@example.com` | `Staff@123` | `staff.html` (Assigned Complaints & Status Updates) |
| **Citizen** | `citizen@example.com` | `Citizen@123` | `dashboard.html` (Submit & Track Grievances) |

---

## 🧪 Postman API Testing

Import the included `postman_collection.json` directly into Postman to test all endpoints:

1. In Postman, click **Import** > **Choose Files**.
2. Select `C:\Users\HP\OneDrive\Desktop\civic report\Online Complaint System\postman_collection.json`.
3. Test endpoints organized by folder:
   * **Authentication**: Register, Login
   * **Complaints**: Submit complaint, List own complaints, Public Track
   * **Admin Management**: Stats, Assign Staff, Update Status, Delete
   * **Staff Operations**: View Assigned Complaints, Resolve Complaints

---

## 🔮 Future Enhancements
* SMS / WhatsApp notification alerts on complaint status transitions.
* Interactive GIS Map view with pinned complaint markers across city sectors.
* Citizen satisfaction rating and feedback collection upon ticket closure.