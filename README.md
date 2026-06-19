🎟️ Eventora

A production-ready full-stack MERN Event Management and Ticket Booking Platform.


 📌 Overview

Eventora is a full-stack event management platform built using the MERN stack. It allows users to browse upcoming events, securely register accounts using email OTP verification, book event tickets, and manage their bookings through a personalized dashboard.

The platform also provides administrators with a dedicated management dashboard to create and manage events, monitor booking requests, track revenue statistics, and control event seat allocations.

 ✨ Features

🔐 Authentication & Security

* User Registration with Email OTP Verification
* Secure Login System
* JWT-Based Authentication
* Password Hashing using bcrypt
* Protected Routes
* Role-Based Authorization (Admin/User)
* Automatic OTP Expiration Mechanism

 👤 User Features

* Browse Upcoming Events
* Search and Filter Events
* View Detailed Event Information
* Book Event Tickets
* OTP Verification During Booking
* View Personal Booking History
* Track Booking Status
* Cancel Existing Bookings
* Automatic Seat Release on Cancellation

 🛠️ Admin Features

* Admin Dashboard
* Create New Events
* Update Existing Events
* Delete Events
* Manage Booking Requests
* Approve or Reject Registrations
* Monitor Revenue Statistics
* Track Total Booking Requests
* Track Paid and Unpaid Registrations
* Automatic Seat Allocation Management

 📊 Dashboard Analytics

Administrators can monitor:

* Total Events
* Total Booking Requests
* Confirmed Bookings
* Paid Registrations
* Revenue Generated
* Available Seats Across Events

🚀 Tech Stack
 Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* React Icons

Backend

* Node.js
* Express.js
* MVC Architecture

Database

* MongoDB Atlas
* Mongoose ODM

 Authentication & Security

* JWT (JSON Web Tokens)
* bcryptjs
* NodeMailer
* Email OTP Verification


🏗️ Project Architecture

```text
Eventora
│
├── client
│   ├── components
│   ├── pages
│   ├── context
│   ├── utils
│   └── assets
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── utils
│   └── seed.js
│
└── README.md
```

---

🔄 Booking Workflow

User Registration
1. User enters registration details
2. OTP is generated
3. OTP is emailed to the user
4. User verifies OTP
5. Account becomes active
6. JWT token is generated

Event Booking

1. User selects an event
2. Booking OTP is generated
3. User verifies OTP
4. Booking request is created
5. Admin reviews booking
6. Admin approves/rejects request
7. Seat count updates automatically

🗄️ Database Models

User

* Name
* Email
* Password
* Role
* Verification Status

 Event

* Title
* Description
* Date
* Location
* Category
* Ticket Price
* Total Seats
* Available Seats
* Created By

 Booking

* User
* Event
* Status
* Payment Status
* Amount

 OTP

* Email
* OTP Code
* Action Type
* Expiry Time

---

⚙️ Installation

 Clone Repository

```bash
git clone https://github.com/your-username/Eventora.git
```

 Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start Backend:

```bash
npm run dev


Frontend Setup

```bash
cd client
npm install
Start Frontend:

```bash
npm run dev


📧 Email System

Eventora uses NodeMailer with Gmail SMTP to:

* Verify newly created accounts
* Verify event ticket bookings
* Handle OTP-based security workflows

All OTPs automatically expire after 5 minutes.

 🔒 Security Features

* Password Hashing
* JWT Authentication
* Protected API Routes
* Role-Based Access Control
* OTP Verification
* Automatic OTP Expiration
* Input Validation

🌟 Future Improvements

* Google OAuth Login
* Online Payment Gateway Integration
* Event Image Uploads
* Event Reviews & Ratings
* PDF Ticket Generation
* Email Notifications
* Event Recommendations
* Real-Time Seat Tracking
* Cloud Storage Integration



 👨‍💻 Author

Laasya Valli

Built as a full-stack MERN application to explore real-world authentication, booking workflows, role-based authorization, dashboard analytics, and scalable backend architecture.

This project is intended for educational and portfolio purposes.
