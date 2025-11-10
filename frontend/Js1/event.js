const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');

fetch(`http://localhost:5000/api/events/${eventId}`)
  .then(res => res.json())
  .then(event => {
    const section = document.getElementById('event-details');
    section.innerHTML = `
      <div class="event-card">
        <h2>${event.title}</h2>
        <p>${event.description}</p>
        <p>Date: ${event.date}</p>
        <p>Location: ${event.location}</p>
        <p>Seats Available: ${event.seats}</p>
      </div>
    `;
  });

document.getElementById('booking-form').addEventListener('submit', e => {
  e.preventDefault();
  const userId = document.getElementById('userId').value;

  fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, event_id: eventId })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('booking-msg').innerText = data.message || 'Booking successful!';
  });
});
