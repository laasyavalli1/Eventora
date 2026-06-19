const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
// Public Routes (Anyone can view events)
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected Admin Routes (Requires authentication AND admin role status)
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;