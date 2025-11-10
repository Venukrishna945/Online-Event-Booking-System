fetch('http://localhost:5000/api/events')
  .then(res => res.json())
  .then(events => {
    const list = document.getElementById('event-list');
    list.innerHTML = '';
    events.forEach(e => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <h2>${e.title}</h2>
        <p>${e.description.substring(0, 60)}...</p>
        <p>Date: ${e.date}</p>
        <p>Location: ${e.location}</p>
        <a href="event.html?id=${e.id}">View Details</a>
      `;
      list.appendChild(card);
    });
  })
  .catch(() => {
    document.getElementById('event-list').innerHTML = '<p>Error loading events.</p>';
  });

