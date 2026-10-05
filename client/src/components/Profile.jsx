import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    setUser(currentUser);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    fetch(`https://campusconnect-dvj.onrender.com/api/users/${currentUser.id}`, {
      headers,
    })
      .then((response) => {
        if (response.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
          return null;
        }

        return response.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
        }
      });

    fetch(
      `https://campusconnect-dvj.onrender.com/api/users/${currentUser.id}/events`,
      {
        headers,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      });

    fetch(
      `https://campusconnect-dvj.onrender.com/api/users/${currentUser.id}/clubs`,
      {
        headers,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setClubs(data);
      });
  }, [navigate]);

  if (!user) {
    return <p className="profile-loading">Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>My Profile</h1>

        <div className="profile-info">
          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-card">
          <h2>{events.length}</h2>
          <p>Registered Events</p>
        </div>

        <div className="profile-stat-card">
          <h2>{clubs.length}</h2>
          <p>Joined Clubs</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>My Registered Events</h2>

        {events.length === 0 ? (
          <p className="empty-message">
            You have not registered for any events yet.
          </p>
        ) : (
          <div className="profile-list">
            {events.map((event) => (
              <div className="profile-item" key={event.id}>
                <h3>{event.title}</h3>

                <p>{event.description}</p>

                <p>📅 {event.date}</p>

                <button
                  onClick={() =>
                    navigate(`/event/${event.id}`)
                  }
                >
                  View Event
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2>My Clubs</h2>

        {clubs.length === 0 ? (
          <p className="empty-message">
            You have not joined any clubs yet.
          </p>
        ) : (
          <div className="profile-list">
            {clubs.map((club) => (
              <div className="profile-item" key={club.id}>
                <h3>{club.name}</h3>

                <p>{club.description}</p>

                <button
                  onClick={() =>
                    navigate(`/club/${club.id}`)
                  }
                >
                  View Club
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;