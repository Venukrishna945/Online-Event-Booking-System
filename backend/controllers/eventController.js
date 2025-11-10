const db = require('../db');

// 1. Get all approved events (for users)
exports.getAllEvents = (req, res) => {
  db.query('SELECT * FROM events WHERE status = "approved" ORDER BY date ASC', (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Error fetching events.' });
    }
    res.json(results);
  });
};

//  2. Get single event by ID
exports.getEventById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM events WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Error fetching event.' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'Event not found.' });
    res.json(results[0]);
  });
};

//  3. Get events by organizer (used for dashboard)
exports.getEventsByOrganizer = (req, res) => {
  const { organizerId } = req.params;
  const query = `
    SELECT e.*, 
           COALESCE(SUM(b.tickets), 0) AS tickets_sold, 
           COALESCE(SUM(b.tickets * e.price), 0) AS revenue
    FROM events e
    LEFT JOIN bookings b ON e.id = b.event_id
    WHERE e.organizer_id = ?
    GROUP BY e.id
    ORDER BY e.date DESC
  `;
  
  db.query(query, [organizerId], (err, results) => {
    if (err) {
      console.error('Error fetching organizer events:', err);
      return res.status(500).json({ message: 'Error fetching organizer events.' });
    }
    res.json(results);
  });
};

//  4. Create new event
exports.createEvent = (req, res) => {
  const { title, description, date, location, seats, price = 0, image, organizer_id } = req.body;
  const query = `
    INSERT INTO events (title, description, date, location, seats, price, image, organizer_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending")
  `;
  db.query(query, [title, description, date, location, seats, price, image, organizer_id], (err, result) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ message: 'Error creating event.' });
    }
    res.json({ message: 'Event created successfully. Awaiting admin approval.' });
  });
};

// 5. Update event (used in Edit popup)
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, seats, price, image } = req.body;

  const query = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, location = ?, seats = ?, price = ?, image = ?
    WHERE id = ?
  `;

  db.query(query, [title, description, date, location, seats, price, image, id], (err, result) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ message: 'Error updating event.' });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event updated successfully.' });
  });
};

// 6. Delete event (with booking check)
exports.deleteEvent = (req, res) => {
  const { id } = req.params;

  // Check if any bookings exist for this event
  const checkQuery = 'SELECT COUNT(*) AS count FROM bookings WHERE event_id = ?';
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error('Error checking bookings:', err);
      return res.status(500).json({ message: 'Error checking bookings.' });
    }

    const bookingCount = result[0].count;
    if (bookingCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete event — bookings already exist for this event.'
      });
    }

    const deleteQuery = 'DELETE FROM events WHERE id = ?';
    db.query(deleteQuery, [id], (err2, result2) => {
      if (err2) {
        console.error('Error deleting event:', err2);
        return res.status(500).json({ message: 'Error deleting event.' });
      }
      if (result2.affectedRows === 0)
        return res.status(404).json({ message: 'Event not found.' });
      res.json({ message: 'Event deleted successfully.' });
    });
  });
};

//  7. Admin can approve/reject events
exports.updateEventStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE events SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ message: 'Error updating status.' });
    }
    res.json({ message: `Event ${status} successfully.` });
  });
};

// 8. Get bookings by user
exports.getBookingsByUser = (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT b.*, e.title AS event_title, e.date AS event_date, e.location AS event_location
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user bookings:', err);
      return res.status(500).json({ message: 'Error fetching bookings.' });
    }
    res.json(results);
  });
};