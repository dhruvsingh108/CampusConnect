# CampusConnect

CampusConnect is a full-stack college community platform that brings campus events, clubs, announcements, and student registrations into one place.

## Features

- User signup and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Campus event discovery
- Search and filter events
- Create, edit, and delete events
- Event registration
- Campus clubs
- Club registration
- Campus announcements
- User profile
- View registered events
- View joined clubs
- Dashboard statistics
- Responsive UI

## Tech Stack

### Frontend

- React
- React Router
- Vite
- CSS

### Backend

- Node.js
- Express.js
- REST APIs
- CORS
- bcrypt
- JSON Web Token (JWT)
- dotenv

### Database

- PostgreSQL

## Project Structure

```text
CampusConnect/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md