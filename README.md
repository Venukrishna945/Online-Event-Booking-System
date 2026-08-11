# Online Event Booking and Management System

This is a full-stack web application developed to manage events and allow users to book tickets online.

The project has three main roles: **User, Organizer, and Admin**. Users can browse and book events, organizers can create and manage their events, and admins can approve or reject events before they are visible to users.

## Features

### User

* Register and login
* View available events
* View event details
* Book tickets
* Check seat availability
* Get a unique ticket ID
* Generate/download ticket as PDF
* View booking details

### Organizer

* Login to organizer dashboard
* Create new events
* Edit event details
* Delete events
* View event bookings
* View basic event statistics
* Check tickets sold and booking percentage

When an organizer creates an event, it is first sent to the admin for approval.

### Admin

* Login to admin panel
* View pending events
* Approve or reject events
* View all events
* Delete events
* View users
* View bookings

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Tools

* VS Code
* Postman
* npm
* Git & GitHub

## How the Project Works

The basic flow of the application is:

```text
Organizer
    |
    | Create Event
    v
Pending Event
    |
    | Admin Approval
    v
Approved Event
    |
    | Visible to Users
    v
User Selects Event
    |
    | Book Tickets
    v
Check Available Seats
    |
    v
Booking Created
    |
    +--> Seats Updated
    |
    +--> Ticket ID Generated
    |
    +--> PDF Ticket Generated
```

## Database

The project uses MySQL as the database.

The main tables are:

### Users

Stores user, organizer and admin account information.

Some important fields include:

* User ID
* Name
* Email
* Password
* Role

### Events

Stores the details of events created by organizers.

Some important fields include:

* Event ID
* Event Name
* Description
* Date
* Time
* Location
* Total Seats
* Available Seats
* Organizer ID
* Status

### Bookings

Stores the ticket booking information.

Some important fields include:

* Booking ID
* User ID
* Event ID
* Ticket ID
* Booking Date
* Number of Tickets

## Booking Process

When a user books an event, the application first checks whether enough seats are available.

If seats are available:

1. The booking is created.
2. The number of available seats is reduced.
3. A unique ticket ID is generated.
4. The ticket can be generated as a PDF.

For example:

```text
Available Seats = 100
User Books = 3

Remaining Seats = 97
```

This helps prevent bookings beyond the available event capacity.

## Organizer Dashboard

The organizer dashboard provides information about the events created by the organizer.

It includes things like:

* Total events
* Tickets sold
* Available seats
* Booking percentage

The booking percentage is calculated using:

```text
Booking Percentage =
(Tickets Sold / Total Seats) × 100
```

## Project Structure

The exact structure may vary depending on the version of the project, but the project is organized into frontend, backend and database parts.

```text
Online-Event-Booking-System
│
├── frontend
│   ├── HTML files
│   ├── CSS files
│   └── JavaScript files
│
├── backend
│   ├── server.js
│   ├── routes
│   ├── controllers
│   ├── models
│   └── package.json
│
├── database
│   └── database.sql
│
├── .gitignore
└── README.md
```

## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/online-event-booking-system.git
```

### 2. Go to the backend folder

```bash
cd backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up MySQL

Create a database in MySQL and import the SQL file from the project.

Example:

```sql
CREATE DATABASE event_booking;
```

Then update the database details in the `.env` file.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_booking
DB_PORT=3306
```

### 5. Start the backend

```bash
npm start
```

If nodemon is configured:

```bash
npm run dev
```

### 6. Open the frontend

Open the frontend using VS Code Live Server or your preferred local development server.

## API

Some of the main operations handled by the backend include:

```text
User
- Register
- Login

Events
- Create event
- Get events
- Get event by ID
- Update event
- Delete event

Bookings
- Create booking
- Get bookings
- Get booking details

Admin
- View pending events
- Approve event
- Reject event
```

## What I Learned From This Project

While working on this project, I got practical experience with:

* Building a full-stack web application
* Creating REST APIs using Node.js and Express.js
* Connecting a backend application with MySQL
* Writing SQL queries
* Implementing CRUD operations
* Handling user login and different user roles
* Managing event bookings and seat availability
* Generating unique ticket IDs
* Generating PDF tickets
* Testing APIs using Postman
* Using Git and GitHub

## Future Improvements

Some features I would like to add in the future:

* Online payment integration
* Email notifications after booking
* QR code for tickets
* Better search and event filtering
* Forgot password functionality
* JWT authentication
* Event images
* Online deployment



This project was developed a personal full-stack project to get practical experience in web application development,
which was done in a TCS Training program.
