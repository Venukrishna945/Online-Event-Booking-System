const db = require('../db');

// Get pending events
exports.getPendingEvents = (req, res) => {
  db.query('SELECT * FROM events WHERE status = "pending"', (err, results) => {
    if (err) {
      console.error('Error fetching pending events:', err);
      return res.status(500).json({ message: 'Error fetching pending events.' });
    }
    res.json(results);
  });
};

// Approve or reject event
exports.updateEventStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.query('UPDATE events SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('Error updating event status:', err);
      return res.status(500).json({ message: 'Error updating status.' });
    }
    res.json({ message: `Event ${status} successfully.` });
  });
};

// Get all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users.' });
    }
    res.json(results);
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  
  // First check if user has any bookings
  db.query('SELECT COUNT(*) as bookingCount FROM bookings WHERE user_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error checking user bookings:', err);
      return res.status(500).json({ message: 'Error checking user data.' });
    }
    
    if (results[0].bookingCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing bookings. Delete bookings first.' 
      });
    }
    
    // Check if user is an organizer with events
    db.query('SELECT COUNT(*) as eventCount FROM events WHERE organizer_id = ?', [id], (err, eventResults) => {
      if (err) {
        console.error('Error checking organizer events:', err);
        return res.status(500).json({ message: 'Error checking user data.' });
      }
      
      if (eventResults[0].eventCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete organizer with existing events. Transfer events first.' 
        });
      }
      
      // Delete the user
      db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({ message: 'Error deleting user.' });
        }
        res.json({ message: 'User deleted successfully.' });
      });
    });
  });
};

// View all bookings (JOIN users & events so frontend can show names/titles)
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