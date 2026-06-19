const Booking = require('../models/Bookings.js');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendOtpEmail, sendBookingEmail } = require('../utils/email');

// Helper function to generate a 6-digit verification code
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Generate and send OTP for event booking verification
// @route   POST /api/bookings/send-otp
exports.sendBookingOtp = async (req, res) => {
    try {
        const { eventId } = req.body;
        const email = req.user.email; // Extracted from active JWT login session context

        // 1. Wipe out any older, unused booking OTPs for this specific email state
        await OTP.findOneAndDelete({ email, action: 'event_booking' });

        // 2. Generate a fresh verification payload code block
        const otpCode = generateOtp();

        // 3. Commit the tracking record directly to the database
        await OTP.create({
            email,
            otp: otpCode,
            action: 'event_booking'
        });

        // 4. Dispatch the structured email notification to the user
        await sendOtpEmail(email, otpCode, 'event_booking');

        res.status(200).json({ message: 'Booking verification OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate OTP and finalize the seat reservation request
// @route   POST /api/bookings/book
exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;
        const email = req.user.email;

        // 1. Validate if matching OTP payload exists and hasn't expired yet
        const otpRecord = await OTP.findOne({ email, otp, action: 'event_booking' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // 2. Enforce check constraint validating event existence
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Target event profile not found' });
        }

        // 3. Confirm inventory allocation pool contains open seating slots
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'Registration failed. Event is fully sold out' });
        }

        // 4. Prevent duplicate registration submissions by the same user account
        const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already filed a registration request for this event' });
        }

        // 5. Initialize base database entry map set to unapproved/unpaid stages
        const booking = await Booking.create({
            user: req.user._id,
            event: eventId,
            amount: event.ticketPrice,
            status: 'pending',
            paymentStatus: 'not_paid'
        });

        // 6. Clear out used token record immediately following validation success
        await OTP.findByIdAndDelete(otpRecord._id);

        res.status(201).json({ message: 'Registration requested successfully. Awaiting review.', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin approving, updating financial metrics, and confirming ticket states
// @route   PUT /api/bookings/confirm/:id
exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        // Safety check enforcing strict data parameters on state properties
        if (!['paid', 'not_paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid status format parameter provided' });
        }

        const booking = await Booking.findById(req.params.id).populate('user event');
        if (!booking) {
            return res.status(404).json({ message: 'Target booking index not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ message: 'This reservation document is already confirmed' });
        }

        // Ensure capacity bounds haven't shifted during transactional lag
        const event = await Event.findById(booking.event._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'Cannot process. Event cap has officially maxed out' });
        }

        // Mutate and apply state transformations
        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;
        await booking.save();

        // Decrement the physical remaining pool size by one
        event.availableSeats -= 1;
        await event.save();

        // Send layout HTML summary confirming order execution status
        await sendBookingEmail(booking.user.email, event.title, booking.user.name);

        res.status(200).json({ message: 'Booking confirmed and ticket issued successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch personal ticket request history array matching current user
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('event');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel personal booking state and re-add seats to active event pool
// @route   DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking record not found' });
        }

        // Route privilege check preventing cross-account manipulation attempts
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized execution attempt flag encountered' });
        }

        // If an approved ticket gets scrubbed, return its seat to the inventory pool
        if (booking.status === 'confirmed') {
            const event = await Event.findById(booking.event);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ message: 'Reservation successfully cancelled', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};