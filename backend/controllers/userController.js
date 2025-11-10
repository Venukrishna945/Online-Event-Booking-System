const db = require('../db');

// Register new user
exports.registerUser = (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user already exists
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    
    if (results.length > 0) {
      return res.json({ success: false, message: 'User already exists with this email.' });
    }
    
    // Insert new user
    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, password, role], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ success: false, message: 'Error registering user.' });
      }
      res.json({ success: true, message: 'User registered successfully.' });
    });
  });
};

// Login
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    if (results.length === 0) return res.json({ success: false, message: 'Invalid credentials.' });
    const user = results[0];
    res.json({ success: true, message: 'Login successful.', user });
  });
};