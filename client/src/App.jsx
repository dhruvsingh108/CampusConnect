import Profile from "./components/Profile";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import EventCard from "./components/EventCard";
import EventDetails from "./components/EventDetails";
import CreateEvent from "./components/CreateEvent";
import EditEvent from "./components/EditEvent";
import Clubs from "./components/Clubs";
import ClubDetails from "./components/ClubDetails";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState({
    events: 0,
    clubs: 0,
    announcements: 0,
    registrations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const backendResponse = await fetch(
          "http://localhost:5000/"
        );

        if (!backendResponse.ok) {
          throw new Error("Backend is not responding");
        }

        const backendMessage = await backendResponse.text();
        setMessage(backendMessage);

        const eventsResponse = await fetch(
          "http://localhost:5000/api/events"
        );

        if (!eventsResponse.ok) {
          throw new Error("Failed to load events");
        }

        const eventsData = await eventsResponse.json();
        setEvents(eventsData);

        const announcementsResponse = await fetch(
          "http://localhost:5000/api/announcements"
        );

        if (!announcementsResponse.ok) {
          throw new Error("Failed to load announcements");
        }

        const announcementsData =
          await announcementsResponse.json();

        setAnnouncements(announcementsData);

        const statsResponse = await fetch(
          "http://localhost:5000/api/stats"
        );

        if (!statsResponse.ok) {
          throw new Error("Failed to load dashboard statistics");
        }

        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          "Unable to load dashboard data. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      event.description
        .toLowerCase()
        .includes(search.toLowerCase());

    const eventDate = new Date(event.date);
    const today = new Date();

    let matchesFilter = true;

    if (filter === "upcoming") {
      matchesFilter = eventDate >= today;
    }

    if (filter === "past") {
      matchesFilter = eventDate < today;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <main className="homepage">
              <section className="hero-section">
                <h1>CampusConnect</h1>

                <p>
                  Everything happening on your campus, in one place.
                </p>
              </section>

              {loading && (
                <div className="loading-message">
                  <p>Loading campus data...</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="stats-section">
                    <div className="stat-card">
                      <h2>{stats.events}</h2>
                      <p>Total Events</p>
                    </div>

                    <div className="stat-card">
                      <h2>{stats.clubs}</h2>
                      <p>Campus Clubs</p>
                    </div>

                    <div className="stat-card">
                      <h2>{stats.announcements}</h2>
                      <p>Announcements</p>
                    </div>

                    <div className="stat-card">
                      <h2>{stats.registrations}</h2>
                      <p>Registrations</p>
                    </div>
                  </div>

                  <section className="events-section">
                    <div className="section-header">
                      <div>
                        <h2>Campus Events</h2>

                        <p>
                          Discover what's happening around campus.
                        </p>
                      </div>
                    </div>

                    <div className="event-controls">
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                      />

                      <select
                        value={filter}
                        onChange={(e) =>
                          setFilter(e.target.value)
                        }
                      >
                        <option value="all">
                          All Events
                        </option>

                        <option value="upcoming">
                          Upcoming Events
                        </option>

                        <option value="past">
                          Past Events
                        </option>
                      </select>
                    </div>

                    <div className="events-container">
                      {filteredEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          id={event.id}
                          title={event.title}
                          description={event.description}
                          date={event.date}
                        />
                      ))}
                    </div>

                    {filteredEvents.length === 0 && (
                      <p>No events found.</p>
                    )}
                  </section>

                  <section className="announcements-section">
                    <h2>Latest Announcements</h2>

                    <div className="announcements-container">
                      {announcements.map((announcement) => (
                        <div
                          className="announcement-card"
                          key={announcement.id}
                        >
                          <h3>{announcement.title}</h3>

                          <p>
                            {announcement.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <p className="backend-status">
                    Backend status: {message}
                  </p>
                </>
              )}
            </main>
          }
        />

        <Route
          path="/event/:id"
          element={<EventDetails />}
        />

        <Route
          path="/create-event"
          element={<CreateEvent />}
        />

        <Route
          path="/edit-event/:id"
          element={<EditEvent />}
        />

        <Route
          path="/clubs"
          element={<Clubs />}
        />

        <Route
          path="/club/:id"
          element={<ClubDetails />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;