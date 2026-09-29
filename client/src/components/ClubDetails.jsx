import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ClubDetails.css";

function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/clubs/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setClub(data);
      });
  }, [id]);

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
        `http://localhost:5000/api/clubs/${id}/register`,
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
          "Successfully registered for the club!"
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

  if (!club) {
    return <p className="loading">Loading club...</p>;
  }

  return (
    <div className="club-details-page">
      <div className="club-details-card">
        <h1>{club.name}</h1>

        <p className="club-description">
          {club.description}
        </p>
      </div>

      <div className="club-registration-card">
        <h2>Join this Club</h2>

        <p>
          Enter your details to register for this campus club.
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
            {registering ? "Registering..." : "Join Club"}
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

      <div className="club-actions">
        <button onClick={() => navigate("/clubs")}>
          Back to Clubs
        </button>
      </div>
    </div>
  );
}

export default ClubDetails;