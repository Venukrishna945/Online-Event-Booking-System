
const db = require('../db');
const crypto = require('crypto');

// Create booking
exports.createBooking = (req, res) => {
  const { user_id, user_name, user_email, event_id, tickets = 1 } = req.body;

  // Validate input
  if ((!user_id && (!user_name || !user_email)) || !event_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields.' 
    });
  }

  // Check event availability
  db.query('SELECT * FROM events WHERE id = ? AND status = "approved"', [event_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Error checking event availability.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found or not approved.' });
    }

    const event = results[0];
    if (event.seats < tickets) {
      return res.json({ 
        success: false, 
        message: `Only ${event.seats} seats available. You requested ${tickets} tickets.` 
      });
    }

    // Generate ticket ID
    const ticket_id = `TKT-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Determine user ID (use existing or create guest record)
    let finalUserId = user_id;
    
    if (!finalUserId) {
      // Create a guest user record
      const guestQuery = 'INSERT INTO users (name, email, role) VALUES (?, ?, "guest")';
      db.query(guestQuery, [user_name, user_email], (err, guestResult) => {
        if (err) {
          console.error('Error creating guest user:', err);
          return res.status(500).json({ success: false, message: 'Error processing booking.' });
        }
        
        finalUserId = guestResult.insertId;
        completeBooking(finalUserId, event, tickets, ticket_id, user_name, res);
      });
    } else {
      completeBooking(finalUserId, event, tickets, ticket_id, user_name, res);
    }
  });
};

function completeBooking(userId, event, tickets, ticket_id, user_name, res) {
  // Insert booking
  const bookingQuery = `
    INSERT INTO bookings (user_id, event_id, ticket_id, tickets, booking_date) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  db.query(bookingQuery, [userId, event.id, ticket_id, tickets], (err, bookingResult) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ success: false, message: 'Error creating booking.' });
    }

    // Update available seats
    db.query('UPDATE events SET seats = seats - ? WHERE id = ?', [tickets, event.id], (err) => {
      if (err) {
        console.error('Error updating seats:', err);
        console.log('Booking created but seat count not updated');
      }

      // Return success with ticket information
      res.json({
        success: true,
        message: 'Booking successful!',
        ticket_id: ticket_id,
        tickets: tickets,
        ticket: {
          event_title: event.title,
          event_date: event.date,
          event_location: event.location,
          user_name: user_name
        }
      });
    });
  });
}

// Get all bookings (for admin)
exports.getAllBookings = (req, res) => {
  const query = `
    SELECT b.*, u.name AS user_name, e.title AS event_title
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN events e ON b.event_id = e.id
    ORDER BY b.booking_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ message: 'Error fetching bookings.' });
    }
    res.json(results);
  });
};

exports.getUserBookings = (req, res) => {
  const { userId } = req.params;
  console.log('Fetching bookings for user:', userId); // Debug log
  const query = `
    SELECT 
      b.*, 
      e.title AS event_title, 
      e.date AS event_date, 
      e.location AS event_location,
      e.price AS event_price
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user bookings:', err);
      return res.status(500).json({ message: 'Error fetching bookings' });
    }
    console.log('User bookings loaded:', results); // Debug log
    res.json(results);
  });
};