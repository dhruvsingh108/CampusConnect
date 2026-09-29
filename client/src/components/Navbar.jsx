import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      return JSON.parse(savedUser);
    }

    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);

    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>CampusConnect</h2>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/create-event">Create Event</Link>

        {user ? (
          <>
            <Link to="/profile">Profile</Link>

            <span className="navbar-user">
              Hi, {user.name}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;