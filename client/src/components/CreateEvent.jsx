import { useState } from "react";
import "./CreateEvent.css";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!title || !description || !date) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create event"
        );
        return;
      }

      setMessage("Event created successfully!");

      setTitle("");
      setDescription("");
      setDate("");
    } catch (error) {
      console.error("Create event error:", error);

      setError(
        "Unable to create event. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-card">
        <h1>Create Event</h1>

        <p>
          Add a new event to your campus community.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Event Title</label>

          <input
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          <label>Description</label>

          <textarea
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            disabled={loading}
          />

          <label>Event Date</label>

          <input
            type="text"
            placeholder="Example: August 25, 2026"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating event..." : "Create Event"}
          </button>
        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateEvent;