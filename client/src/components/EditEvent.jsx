import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditEvent.css";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch(
          `https://campusconnect-dvj.onrender.com/api/events/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load event");
        }

        const data = await response.json();

        setTitle(data.title);
        setDescription(data.description);
        setDate(data.date);
      } catch (error) {
        console.error("Load event error:", error);
        setError("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!title || !description || !date) {
      setError("Please fill all fields");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `https://campusconnect-dvj.onrender.com/api/events/${id}`,
        {
          method: "PUT",
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

      if (response.ok) {
        navigate(`/event/${id}`);
      } else {
        setError(
          data.message || "Failed to update event"
        );
      }
    } catch (error) {
      console.error("Update event error:", error);

      setError(
        "Unable to update event. Please make sure the backend is running."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="loading">Loading event...</p>;
  }

  return (
    <div className="edit-event-page">
      <div className="edit-event-card">
        <h1>Edit Event</h1>

        <p>
          Update the details of this campus event.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Event Title</label>

          <input
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={updating}
          />

          <label>Description</label>

          <textarea
            placeholder="Enter event description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows="5"
            disabled={updating}
          />

          <label>Event Date</label>

          <input
            type="text"
            placeholder="Example: August 25, 2026"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={updating}
          />

          <button type="submit" disabled={updating}>
            {updating ? "Updating event..." : "Update Event"}
          </button>
        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default EditEvent;