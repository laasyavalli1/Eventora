const express = require('express');
const router = express.Router();
const {
    bookEvent,
    sendBookingOtp,
    getMyBookings,
    confirmBooking,
    cancelBooking
} = require('../controllers/bookingController.js');
const { protect, admin } = require('../middleware/auth');

// Standard user operations (Must be logged in to view or request bookings)
router.post('/send-otp', protect, sendBookingOtp);
router.post('/book', protect, bookEvent);
router.get('/my', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);

// Administrative operations (Requires valid login AND explicit admin permissions)
router.put('/:id/confirm', protect, admin, confirmBooking);

module.exports = router;