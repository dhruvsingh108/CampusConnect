require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  res.send("CampusConnect Backend is running!");
});

// ==================== SIGNUP ====================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== LOGIN ====================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== USER PROFILE ====================

// Protected route
app.get("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Protected route
app.get(
  "/api/users/:id/events",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT events.id, events.title, events.description, events.date
         FROM event_registrations
         JOIN events ON event_registrations.event_id = events.id
         WHERE event_registrations.student_email =
         (SELECT email FROM users WHERE id = $1)
         ORDER BY events.id`,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("User events error:", error);

      res.status(500).json({
        message: "Failed to fetch registered events",
      });
    }
  }
);

// Protected route
app.get(
  "/api/users/:id/clubs",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT clubs.id, clubs.name, clubs.description
         FROM club_registrations
         JOIN clubs ON club_registrations.club_id = clubs.id
         WHERE club_registrations.student_email =
         (SELECT email FROM users WHERE id = $1)
         ORDER BY clubs.id`,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("User clubs error:", error);

      res.status(500).json({
        message: "Failed to fetch joined clubs",
      });
    }
  }
);

// ==================== EVENTS ====================

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching events:", error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

// Get one event
app.get("/api/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log("Error fetching event:", error);

    res.status(500).json({
      message: "Failed to fetch event",
    });
  }
});

// Create event
app.post("/api/events", async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        message: "Event title must be at least 3 characters",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        message: "Event description must be at least 10 characters",
      });
    }

    const result = await pool.query(
      `INSERT INTO events (title, description, date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), description.trim(), date.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      message: "Failed to create event",
    });
  }
});

// Update event
app.put("/api/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        message: "Event title must be at least 3 characters",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        message: "Event description must be at least 10 characters",
      });
    }

    const result = await pool.query(
      `UPDATE events
       SET title = $1, description = $2, date = $3
       WHERE id = $4
       RETURNING *`,
      [title.trim(), description.trim(), date.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      message: "Failed to update event",
    });
  }
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.log("Error deleting event:", error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
});

// ==================== CLUBS ====================

// Get all clubs
app.get("/api/clubs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clubs ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching clubs:", error);

    res.status(500).json({
      message: "Failed to fetch clubs",
    });
  }
});

// Get one club
app.get("/api/clubs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "SELECT * FROM clubs WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log("Error fetching club:", error);

    res.status(500).json({
      message: "Failed to fetch club",
    });
  }
});

// ==================== CLUB REGISTRATION ====================

app.post("/api/clubs/:id/register", async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const { student_name, student_email } = req.body;

    if (!student_name || !student_email) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (!student_email.includes("@")) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    const club = await pool.query(
      "SELECT id FROM clubs WHERE id = $1",
      [clubId]
    );

    if (club.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO club_registrations
       (club_id, student_name, student_email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        clubId,
        student_name.trim(),
        student_email.trim(),
      ]
    );

    res.status(201).json({
      message: "Successfully registered for the club",
      registration: result.rows[0],
    });
  } catch (error) {
    console.error("Club registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ==================== ANNOUNCEMENTS ====================

app.get("/api/announcements", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM announcements ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log("Error fetching announcements:", error);

    res.status(500).json({
      message: "Failed to fetch announcements",
    });
  }
});

// ==================== DASHBOARD STATS ====================

app.get("/api/stats", async (req, res) => {
  try {
    const events = await pool.query(
      "SELECT COUNT(*) FROM events"
    );

    const clubs = await pool.query(
      "SELECT COUNT(*) FROM clubs"
    );

    const announcements = await pool.query(
      "SELECT COUNT(*) FROM announcements"
    );

    const eventRegistrations = await pool.query(
      "SELECT COUNT(*) FROM event_registrations"
    );

    const clubRegistrations = await pool.query(
      "SELECT COUNT(*) FROM club_registrations"
    );

    res.json({
      events: parseInt(events.rows[0].count),
      clubs: parseInt(clubs.rows[0].count),
      announcements: parseInt(
        announcements.rows[0].count
      ),
      registrations:
        parseInt(eventRegistrations.rows[0].count) +
        parseInt(clubRegistrations.rows[0].count),
    });
  } catch (error) {
    console.error("Stats error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

// ==================== EVENT REGISTRATION ====================

app.post("/api/events/:id/register", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { student_name, student_email } = req.body;

    if (!student_name || !student_email) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (!student_email.includes("@")) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    const event = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [eventId]
    );

    if (event.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO event_registrations
       (event_id, student_name, student_email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        eventId,
        student_name.trim(),
        student_email.trim(),
      ]
    );

    res.status(201).json({
      message: "Successfully registered for the event",
      registration: result.rows[0],
    });
  } catch (error) {
    console.error("Event registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ==================== DATABASE CONNECTION ====================

pool.query("SELECT NOW()", (error, result) => {
  if (error) {
    console.log(
      "PostgreSQL connection failed:",
      error
    );
  } else {
    console.log(
      "PostgreSQL connected successfully!"
    );

    console.log(
      "Database time:",
      result.rows[0].now
    );
  }
});

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});