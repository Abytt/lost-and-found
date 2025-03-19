import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Updated import path

function Navbar() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-search-heart me-2"></i>
          DocTrack
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/"><i className="bi bi-house-door me-1"></i> Home</Link>
            </li>
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/report-lost"><i className="bi bi-exclamation-triangle me-1"></i> Report Lost</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/report-found"><i className="bi bi-check-circle me-1"></i> Report Found</Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/search"><i className="bi bi-search me-1"></i> Search</Link>
            </li>
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/lost-found"><i className="bi bi-list-ul me-1"></i> Lost & Found</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/match-lost-found"><i className="bi bi-lightning me-1"></i> AI Matches</Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/about"><i className="bi bi-info-circle me-1"></i> About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact"><i className="bi bi-envelope me-1"></i> Contact</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/blood-donor">Blood Donor Helper</Link>
            </li>
          </ul>
          
          {/* Authentication Links */}
          <ul className="navbar-nav ms-auto">
            {currentUser ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {currentUser.displayName || currentUser.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-reports">
                      <i className="bi bi-file-earmark-text me-2"></i>My Reports
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-outline-light btn-sm py-1 px-3 mt-1" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          {error && <div className="alert alert-danger mt-2 mb-0 py-1 px-2">{error}</div>}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;