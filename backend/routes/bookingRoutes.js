const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
// const eventController = require('../controllers/eventController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/user/:userId', bookingController.getUserBookings);

module.exports = router;