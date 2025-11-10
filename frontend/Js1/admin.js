document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.href = 'login.html';
    return;
  }
  
  loadPendingEvents();
  loadAllEvents();
  loadAllBookings();
  loadUsers();
});

// --- Fetch Pending Events ---
async function loadPendingEvents() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/pending-events");
    const events = await res.json();
    const container = document.getElementById("pending-events");

    if (!events || events.length === 0) {
      container.innerHTML = "<p>No pending events found</p>";
      return;
    }

    container.innerHTML = events.map(event => `
      <div class="event-card">
        <div class="event-info">
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Organizer ID:</strong> ${event.organizer_id}</p>
          <p>${event.description}</p>
          <div class="action-btns">
            <button class="approve-btn" onclick="approveEvent(${event.id})">Approve</button>
            <button class="reject-btn" onclick="rejectEvent(${event.id})">Reject</button>
          </div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error('Error loading pending events:', error);
    document.getElementById("pending-events").innerHTML = "<p>Error loading pending events</p>";
  }
}

async function approveEvent(id) {
  try {
    await fetch(`http://localhost:5000/api/admin/event/${id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    });
    alert("Event approved ");
    loadPendingEvents();
    loadAllEvents();
  } catch (error) {
    console.error('Error approving event:', error);
    alert("Error approving event");
  }
}

async function rejectEvent(id) {
  try {
    await fetch(`http://localhost:5000/api/admin/event/${id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    alert("Event rejected ");
    loadPendingEvents();
  } catch (error) {
    console.error('Error rejecting event:', error);
    alert("Error rejecting event");
  }
}

// --- Fetch All Events ---
async function loadAllEvents() {
  try {
    const res = await fetch("http://localhost:5000/api/events");
    const events = await res.json();
    const container = document.getElementById("all-events");

    container.innerHTML = events.map(event => `
      <div class="event-card">
        <div class="event-info">
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Seats:</strong> ${event.seats}</p>
          <p><strong>Status:</strong> ${event.status}</p>
          <div class="action-btns">
            <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete Event</button>
          </div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error('Error loading all events:', error);
    document.getElementById("all-events").innerHTML = "<p>Error loading events</p>";
  }
}

// Delete event
async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/events/${id}`, { 
      method: "DELETE" 
    });
    const result = await response.json();
    
    if (response.ok) {
      alert("Event deleted successfully");
      loadAllEvents();
    } else {
      alert(result.message || "Error deleting event");
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    alert("Error deleting event");
  }
}

// --- Fetch Bookings ---
async function loadAllBookings() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/bookings");
    const bookings = await res.json();
    const table = document.getElementById("all-bookings");

    if (!bookings || bookings.length === 0) {
      table.innerHTML = "<tr><td colspan='6'>No bookings found</td></tr>";
      return;
    }

    table.innerHTML = bookings.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${b.user_name || 'N/A'}</td>
        <td>${b.event_title || 'N/A'}</td>
        <td>${b.ticket_id || 'N/A'}</td>
        <td>${b.tickets || 1}</td>
        <td>${b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error('Error loading bookings:', error);
    document.getElementById("all-bookings").innerHTML = "<tr><td colspan='6'>Error loading bookings</td></tr>";
  }
}

// --- Fetch Users ---
async function loadUsers() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/users");
    const users = await res.json();
    const table = document.getElementById("user-list");

    if (!users || users.length === 0) {
      table.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
      return;
    }

    table.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button class="delete-btn" onclick="deleteUser(${u.id})">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById("user-list").innerHTML = "<tr><td colspan='5'>Error loading users</td></tr>";
  }
}

// Delete user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, { 
      method: "DELETE" 
    });
    const result = await response.json();
    
    if (response.ok) {
      alert("User deleted successfully");
      loadUsers();
    } else {
      alert(result.message || "Error deleting user");
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert("Error deleting user");
  }
}

//dynamic navbar
const navbar = document.getElementById('navbar');
function renderNavbar() {
    let navHTML = `
        <a href="index.html">Home</a>
        <a href="events.html">Events</a>
        <a href="organizer.html" class="active">Dashboard</a>
        <a href="#" id="logoutBtn">Logout</a>
    `;
    navbar.innerHTML = navHTML;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}
renderNavbar();