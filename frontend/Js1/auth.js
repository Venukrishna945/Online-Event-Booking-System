//  REGISTER USER 
const regForm = document.getElementById('register-form');
if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();

    const user = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      role: document.getElementById('role').value
    };

    fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
      .then(res => res.json())
      .then(data => {
        const msg = document.getElementById('register-msg');
        msg.innerText = data.message;

        if (data.success) {
          msg.style.color = 'green';
          // Redirect to login after short delay
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          msg.style.color = 'red';
        }
      })
      .catch(err => {
        console.error('Registration error:', err);
        document.getElementById('register-msg').innerText = 'Registration failed. Please try again.';
        document.getElementById('register-msg').style.color = 'red';
      });
  });
}

//  LOGIN USER 
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const credentials = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
      .then(res => res.json())
      .then(data => {
        const msg = document.getElementById('login-msg');
        msg.innerText = data.message;

        if (data.success) {
          msg.style.color = 'green';
          localStorage.setItem('user', JSON.stringify(data.user));

          // Redirect based on role
          setTimeout(() => {
            if (data.user.role === 'organizer') {
              window.location.href = 'organizer.html';
            } else if (data.user.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'index.html'; // Normal user
            }
          }, 1000);
        } else {
          msg.style.color = 'red';
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        document.getElementById('login-msg').innerText = 'Login failed. Please try again.';
        document.getElementById('login-msg').style.color = 'red';
      });
  });
}