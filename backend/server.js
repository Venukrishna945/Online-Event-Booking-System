
const express = require("express");
const cors = require("cors");
const path = require("path");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database connection
const db = require("./db");

//  Routes
const adminRoutes = require("./routes/adminRoutes");
const usersRoutes = require("./routes/userRoutes");
const eventsRoutes = require("./routes/eventRoutes");
const bookingsRoutes = require("./routes/bookingRoutes");

//  Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/bookings", bookingsRoutes);

//  Serve frontend (HTML, CSS, JS)
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));


app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});



//Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
