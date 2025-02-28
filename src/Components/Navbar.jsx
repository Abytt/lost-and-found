import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-search-heart me-2"></i>
          Lost & Found
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/"><i className="bi bi-house-door me-1"></i> Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/report-lost"><i className="bi bi-exclamation-triangle me-1"></i> Report Lost</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/report-found"><i className="bi bi-check-circle me-1"></i> Report Found</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search"><i className="bi bi-search me-1"></i> Search</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/lost-found"><i className="bi bi-list-ul me-1"></i> Lost & Found</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about"><i className="bi bi-info-circle me-1"></i> About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact"><i className="bi bi-envelope me-1"></i> Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
