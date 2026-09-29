import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setEvent(data);
      });
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        alert("Failed to delete event");
        setDeleting(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unable to delete event");
      setDeleting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterMessage("");
    setRegisterError("");

    if (!studentName || !studentEmail) {
      setRegisterError("Please fill all fields");
      return;
    }

    if (!studentEmail.includes("@")) {
      setRegisterError("Please enter a valid email");
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_name: studentName,
            student_email: studentEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRegisterMessage(
          "Successfully registered for the event!"
        );

        setStudentName("");
        setStudentEmail("");
      } else {
        setRegisterError(
          data.message || "Registration failed"
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setRegisterError(
        "Unable to register. Please make sure the backend is running."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (!event) {
    return <p className="loading">Loading event...</p>;
  }

  return (
    <div className="event-details-page">
      <div className="event-details-card">
        <h1>{event.title}</h1>

        <p className="event-description">
          {event.description}
        </p>

        <p className="event-details-date">
          📅 {event.date}
        </p>
      </div>

      <div className="registration-card">
        <h2>Register for this Event</h2>

        <p>
          Enter your details to register for this campus event.
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Your name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            disabled={registering}
          />

          <input
            type="email"
            placeholder="Your email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            disabled={registering}
          />

          <button type="submit" disabled={registering}>
            {registering ? "Registering..." : "Register"}
          </button>
        </form>

        {registerMessage && (
          <p className="success-message">
            {registerMessage}
          </p>
        )}

        {registerError && (
          <p className="error-message">
            {registerError}
          </p>
        )}
      </div>

      <div className="event-actions">
        <button
          onClick={() => navigate(`/edit-event/${id}`)}
          disabled={deleting}
        >
          Edit Event
        </button>

        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Event"}
        </button>

        <button
          onClick={() => navigate("/")}
          disabled={deleting}
        >
          Back to Events
        </button>
      </div>
    </div>
  );
}

export default EventDetails;