// Check if user is organizer
const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'organizer') {
    alert('Access denied. Organizers only.');
    window.location.href = 'login.html';
}

// Set up dynamic navbar
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

const eventContainer = document.getElementById('my-events');
const createForm = document.getElementById('create-event-form');
const createEventBtn = document.getElementById('createEventBtn');

// Analytics Cards
const totalEventsCard = document.getElementById('totalEventsCard').querySelector('h2');
const ticketsSoldCard = document.getElementById('ticketsSoldCard').querySelector('h2');
const revenueCard = document.getElementById('revenueCard').querySelector('h2');
const avgBookingCard = document.getElementById('avgBookingCard').querySelector('h2');

// Modal Elements
const editModal = document.getElementById('editModal');
const editId = document.getElementById('editId');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editDate = document.getElementById('editDate');
const editLocation = document.getElementById('editLocation');
const editSeats = document.getElementById('editSeats');
const editPrice = document.getElementById('editPrice');
const editImage = document.getElementById('editImage');
const updateEventBtn = document.getElementById('updateEventBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// --- Load Organizer's Events ---
function loadMyEvents() {
    console.log('Loading events for organizer:', user.id);
    
    fetch(`http://localhost:5000/api/events/organizer/${user.id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch events');
            }
            return res.json();
        })
        .then(events => {
            console.log('Events loaded:', events);
            loadAnalytics(events);
            renderEvents(events);
        })
        .catch(err => {
            console.error('Error loading events:', err);
            eventContainer.innerHTML = '<p>Error loading events. Please try again.</p>';
        });
}

function renderEvents(events) {
    eventContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        eventContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No events created yet.</p>
                <p>Click "Create New Event" to get started!</p>
            </div>
        `;
        return;
    }
    
    events.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${ev.title}</h3>
            <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${ev.location}</p>
            <p><strong>Seats:</strong> ${ev.seats} available</p>
            <p><strong>Tickets Sold:</strong> ${ev.tickets_sold || 0}</p>
            <p><strong>Revenue:</strong> ₹${ev.revenue || 0}</p>
            <p><strong>Status:</strong> <span class="status-${ev.status}">${ev.status}</span></p>
            <button class="edit" data-id="${ev.id}">Edit</button>
            <button class="delete" data-id="${ev.id}">Delete</button>
        `;
        eventContainer.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit').forEach(btn =>
        btn.addEventListener('click', () => openEditModal(btn.dataset.id))
    );

    document.querySelectorAll('.delete').forEach(btn =>
        btn.addEventListener('click', () => deleteEvent(btn.dataset.id))
    );
}

// --- Analytics Loader ---
function loadAnalytics(events) {
    if (!events || events.length === 0) {
        totalEventsCard.textContent = '0';
        ticketsSoldCard.textContent = '0';
        revenueCard.textContent = '₹0.00';
        avgBookingCard.textContent = '0%';
        return;
    }

    totalEventsCard.textContent = events.length;

    let totalTickets = 0;
    let totalRevenue = 0;
    let bookedSeats = 0;
    let totalSeats = 0;

    events.forEach(ev => {
        const tickets = Number(ev.tickets_sold) || 0;
        const revenue = parseFloat(ev.revenue) || 0;
        const seats = Number(ev.seats) || 0;

        totalTickets += tickets;
        totalRevenue += revenue;
        bookedSeats += tickets;
        totalSeats += seats;
    });

    ticketsSoldCard.textContent = totalTickets;
    revenueCard.textContent = '₹' + totalRevenue.toFixed(2);
    avgBookingCard.textContent = totalSeats
        ? ((bookedSeats / totalSeats) * 100).toFixed(1) + '%'
        : '0%';
}


// --- Create Event ---
createEventBtn.addEventListener('click', () => {
    createForm.style.display = createForm.style.display === 'none' ? 'block' : 'none';
});

createForm.addEventListener('submit', e => {
    e.preventDefault();
    const newEvent = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: document.getElementById('date').value,
        location: document.getElementById('location').value,
        seats: parseInt(document.getElementById('seats').value),
        price: parseFloat(document.getElementById('price').value) || 0,
        image: document.getElementById('image').value,
        organizer_id: user.id
    };

    fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById('create-msg');
        msg.textContent = data.message;
        
        if (data.message.includes('successfully')) {
            msg.style.color = 'green';
            loadMyEvents(); // Reload events after creation
            createForm.reset();
            createForm.style.display = 'none';
        } else {
            msg.style.color = 'red';
        }
    })
    .catch(err => {
        console.error('Error creating event:', err);
        document.getElementById('create-msg').textContent = 'Error creating event. Please try again.';
        document.getElementById('create-msg').style.color = 'red';
    });
});

// --- Edit Event Modal ---
function openEditModal(id) {
    fetch(`http://localhost:5000/api/events/${id}`)
        .then(res => res.json())
        .then(ev => {
            editId.value = ev.id;
            editTitle.value = ev.title;
            editDescription.value = ev.description || '';
            
            // Format date for datetime-local input
            const date = new Date(ev.date);
            const formattedDate = date.toISOString().slice(0, 16);
            editDate.value = formattedDate;
            
            editLocation.value = ev.location;
            editSeats.value = ev.seats;
            editPrice.value = ev.price || '';
            editImage.value = ev.image || '';
            editModal.style.display = 'flex';
        })
        .catch(err => {
            console.error('Error loading event for edit:', err);
            alert('Error loading event details');
        });
}

updateEventBtn.addEventListener('click', () => {
    const updatedEvent = {
        title: editTitle.value,
        description: editDescription.value,
        date: editDate.value,
        location: editLocation.value,
        seats: parseInt(editSeats.value),
        price: parseFloat(editPrice.value) || 0,
        image: editImage.value
    };

    fetch(`http://localhost:5000/api/events/${editId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        editModal.style.display = 'none';
        loadMyEvents(); // Reload events after update
    })
    .catch(err => {
        console.error('Error updating event:', err);
        alert('Error updating event');
    });
});

closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// --- Delete Event ---
function deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
        fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                loadMyEvents(); // Reload events after deletion
            })
            .catch(err => {
                console.error('Error deleting event:', err);
                alert('Error deleting event');
            });
    }
}

// Load initial data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMyEvents();
});