import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Clubs.css";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/clubs")
      .then((response) => response.json())
      .then((data) => {
        setClubs(data);
      });
  }, []);

  return (
    <div className="clubs-page">
      <h1>Campus Clubs</h1>

      <p>
        Explore clubs and communities on your campus.
      </p>

      <div className="clubs-container">
        {clubs.map((club) => (
          <div className="club-card" key={club.id}>
            <h2>{club.name}</h2>

            <p>{club.description}</p>

            <button onClick={() => navigate(`/club/${club.id}`)}>
              View Club
            </button>
          </div>
        ))}
      </div>

      {clubs.length === 0 && <p>Loading clubs...</p>}
    </div>
  );
}

export default Clubs;