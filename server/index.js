// 1. Environment Configurations (Load this before ANY app files try to read variables)
require('dotenv').config();

// 2. Core Library Dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Force clean DNS resolution servers to prevent connection drops
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 3. Application Routing Modules (Safe to import now that process.env is populated)
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/booking.js');


// 4. App Initialization & Global Middlewares
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parses incoming JSON bodies
app.use(cors());         // Prevents CORS blocking issues

// 5. Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/booking.js', bookingRoutes);

// Baseline Welcome Route for Testing Connection
app.get('/', (req, res) => {
    res.send('Eventora Backend API Server is Active!');
});

// 6. MongoDB Atlas Cloud Database Connection Setup
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Cloud Database Successfully.");
    })
    .catch((err) => {
        console.error("Database Connection Aborted Due To Error:", err.message);
    });

// 7. Spin Up the Server Framework Listeners
app.listen(PORT, () => {
    console.log(`Express API Server is actively listening on Port: ${PORT}`);
});