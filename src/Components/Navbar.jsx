// src/Components/Navbar.jsx - Updated with proper dropdown structure and Messages link
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useUnreadMessages } from '../hooks/useUnreadMessages';

// Add this export before the Navbar function
export const triggerReportDropdown = () => {
  const reportDropdownBtn = document.querySelector('[data-bs-toggle="dropdown"]');
  if (reportDropdownBtn) {
    reportDropdownBtn.click();
  }
};

function Navbar() {
  const [error, setError] = useState("");
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, error: messageError } = useUnreadMessages();
  
  // Safely check if user is admin
  const userIsAdmin = currentUser && isAdmin && isAdmin();

  // Update the getUnreadBadge function
  const getUnreadBadge = (count) => {
    if (!count || count <= 0) return null;
    return (
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {count > 99 ? '99+' : count}
        <span className="visually-hidden">unread messages</span>
      </span>
    );
  };

  // Add error handling for message fetching
  useEffect(() => {
    if (messageError) {
      console.error('Error fetching messages:', messageError);
      // Optionally show a user-friendly error message
      setError('Unable to fetch messages. Please try again later.');
    }
  }, [messageError]);

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-archive-fill me-2"></i>
          <span className="fw-bold">DocTrack</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            
            {currentUser && (
              <>
                {/* Fixed Report Dropdown */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#"
                    role="button"
                    id="reportDropdown"  // Add this ID
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-journal-plus me-1"></i> Report
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/report-lost">
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                        Report Lost Item
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/report-found">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Report Found Item
                      </Link>
                    </li>
                  </ul>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/lost-found">
                    <i className="bi bi-list-ul me-1"></i> Lost & Found
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/my-reports">
                    <i className="bi bi-file-earmark-text me-1"></i> My Reports
                  </Link>
                </li>
                
                {/* New Messages Link */}
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative" 
                    to="/messages"
                    aria-label={`Messages ${unreadCount ? `(${unreadCount} unread)` : ''}`}
                  >
                    <i className="bi bi-envelope me-1"></i> Messages
                    {getUnreadBadge(unreadCount)}
                  </Link>
                </li>
              </>
            )}
            
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                <i className="bi bi-search me-1"></i> Search
              </Link>
            </li>
            
            {userIsAdmin && (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="adminDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin
                </a>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li>
                    <Link className="dropdown-item" to="/admin">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/match-lost-found">
                      <i className="bi bi-lightning-charge me-2"></i>
                      AI Matches
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="infoDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-info-circle me-1"></i> Info
              </a>
              <ul className="dropdown-menu" aria-labelledby="infoDropdown">
                <li>
                  <Link className="dropdown-item" to="/about">
                    <i className="bi bi-people me-2"></i>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/contact">
                    <i className="bi bi-envelope me-2"></i>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/blood-donor">
                    <i className="bi bi-heart me-2"></i>
                    Blood Donor Helper
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          
          <div className="d-flex">
            {currentUser ? (
              <div className="dropdown">
                <a 
                  href="#" 
                  className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center me-2" style={{width: "32px", height: "32px"}}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span>{currentUser.displayName || currentUser.email}</span>
                  {userIsAdmin && (
                    <span className="badge bg-warning text-dark ms-2">Admin</span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person-circle me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item position-relative" 
                      to="/messages"
                      aria-label={`Messages ${unreadCount ? `(${unreadCount} unread)` : ''}`}
                    >
                      <i className="bi bi-envelope me-2"></i>
                      Messages
                      {unreadCount > 0 && (
                        <span className="badge bg-danger ms-2">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex">
                <Link to="/login" className="btn btn-outline-light me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
                
              </div>
            )}
          </div>
          
          {error && (
            <div className="alert alert-danger mt-2 py-1 px-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;