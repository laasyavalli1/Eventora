const Event = require('../models/Event');

// @desc    Get all events with optional category/price filtering
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const filters = {};

        // Check if query parameters exist in the request URL for granular searching
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketPrice) {
            filters.ticketPrice = req.query.ticketPrice;
        }

        // Fetch matching documents from MongoDB collection
        const events = await Event.find(filters);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single event detail by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a brand new event listing (Admin Only)
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

        const newEvent = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats, // Set initially equal to total capacity pool
            ticketPrice,
            imageUrl,
            createdBy: req.user._id // Extracted from decoded JWT context by authentication check middleware
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing event profile (Admin Only)
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return modified document state and enforce schema checks
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Wipe out an event database document (Admin Only)
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};