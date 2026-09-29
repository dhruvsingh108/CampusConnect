import { useNavigate } from "react-router-dom";
import "./EventCard.css";

function EventCard({ id, title, description, date }) {
  const navigate = useNavigate();

  return (
    <div className="event-card">
      <h3>{title}</h3>

      <p>{description}</p>

      <p className="event-date">📅 {date}</p>

      <button onClick={() => navigate(`/event/${id}`)}>
        View Event
      </button>
    </div>
  );
}

export default EventCard;