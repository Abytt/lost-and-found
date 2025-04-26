// src/Components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useAdmin } from "./AdminContext";
import { rtdb } from "../firebase";
import { ref, onValue, remove, update } from "firebase/database";
import "./AdminDashboard.css";

// Import React Icons
import { FiUsers, FiSearch, FiAlertTriangle, FiCheckCircle, FiLink, FiPieChart, FiTrash2, FiEdit } from "react-icons/fi";

function AdminDashboard() {
  console.log("AdminDashboard rendering");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isAdmin, adminStats, loading: adminLoading } = useAdmin();
  console.log("Current user:", currentUser);
  console.log("Is admin function:", isAdmin);
  console.log("Is admin result:", isAdmin ? isAdmin() : "isAdmin function not available");
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!currentUser) {
      console.log("No current user, redirecting to login");
      navigate("/login");
      return;
    }

    if (!isAdmin || !isAdmin()) {
      console.log("Not an admin user, redirecting to my-reports");
      navigate("/my-reports");
      return;
    }

    console.log("Admin user confirmed, fetching data");
    setLoading(true);

    // Create references once to avoid redeclaration
    const usersRef = ref(rtdb, "users");
    const entriesRef = ref(rtdb, "entries");
    const matchesRef = ref(rtdb, "matches");

    // Fetch users
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      console.log("Users snapshot:", snapshot.exists() ? "exists" : "does not exist");
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key]
        }));
        console.log("Users loaded:", usersArray.length);
        setUsers(usersArray);
      } else {
        console.log("No users found");
        setUsers([]);
      }
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    // Fetch entries (lost and found items)
    const entriesUnsubscribe = onValue(entriesRef, (snapshot) => {
      console.log("Entries snapshot:", snapshot.exists() ? "exists" : "does not exist");
      if (snapshot.exists()) {
        const entriesData = snapshot.val();
        const entriesArray = Object.keys(entriesData).map(key => ({
          id: key,
          ...entriesData[key]
        }));

        const lostItemsArray = entriesArray.filter(entry => entry.type === "Lost");
        const foundItemsArray = entriesArray.filter(entry => entry.type === "Found");

        console.log("Lost items:", lostItemsArray.length);
        console.log("Found items:", foundItemsArray.length);
        
        setLostItems(lostItemsArray);
        setFoundItems(foundItemsArray);
      } else {
        console.log("No entries found");
        setLostItems([]);
        setFoundItems([]);
      }
    }, (error) => {
      console.error("Error fetching entries:", error);
    });

    // Fetch matches
    const matchesUnsubscribe = onValue(matchesRef, (snapshot) => {
      console.log("Matches snapshot:", snapshot.exists() ? "exists" : "does not exist");
      if (snapshot.exists()) {
        const matchesData = snapshot.val();
        const matchesArray = Object.keys(matchesData).map(key => ({
          id: key,
          ...matchesData[key]
        }));
        console.log("Matches loaded:", matchesArray.length);
        setMatches(matchesArray);
      } else {
        console.log("No matches found");
        setMatches([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching matches:", error);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      usersUnsubscribe();
      entriesUnsubscribe();
      matchesUnsubscribe();
    };
  }, [currentUser, isAdmin, navigate]);

  // Function to delete an item
  const handleDeleteItem = (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} item?`)) {
      return;
    }

    const itemRef = ref(rtdb, `entries/${id}`);
    
    remove(itemRef)
      .then(() => {
        alert(`${type} item deleted successfully!`);
      })
      .catch(error => {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      });
  };

  // Function to update user role
  const handleUpdateUserRole = (userId, newRole) => {
    const userRef = ref(rtdb, `users/${userId}`);
    
    update(userRef, { role: newRole })
      .then(() => {
        alert("User role updated successfully!");
      })
      .catch(error => {
        console.error("Error updating user role:", error);
        alert("Failed to update user role. Please try again.");
      });
  };

  // Function to handle match review
  const handleReviewMatch = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  // Function to update match status
  const updateMatchStatus = (matchId, newStatus) => {
    const matchRef = ref(rtdb, `matches/${matchId}`);
    
    update(matchRef, { status: newStatus })
      .then(() => {
        alert(`Match status updated to ${newStatus}`);
        setShowMatchModal(false);
      })
      .catch(error => {
        console.error("Error updating match status:", error);
        alert("Failed to update match status. Please try again.");
      });
  };

  // Filter functions for search
  const filterItems = (items) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      (item.document && item.document.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.contact && item.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (loading || adminLoading) {
    return (
      <div className="admin-loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin || !isAdmin()) {
    return (
      <div className="admin-unauthorized">
        <div className="alert alert-danger">
          <h3><FiAlertTriangle className="me-2" />Unauthorized Access</h3>
          <p>You do not have permission to access the admin dashboard.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate("/my-reports")}
          >
            Go to My Reports
          </button>
        </div>
      </div>
    );
  }

  const filteredLostItems = filterItems(lostItems);
  const filteredFoundItems = filterItems(foundItems);
  const filteredUsers = searchTerm ? users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : users;

  return (
    <div className="admin-dashboard">
      {/* Top Navigation */}
      <div className="admin-top-navbar">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">DocTrack Admin</h2>
            <div className="d-flex align-items-center">
              {currentUser && (
                <div className="admin-user-info">
                  <span className="admin-welcome">Welcome, Admin</span>
                  <span className="admin-email">{currentUser.email}</span>
                </div>
              )}
              <button 
                className="btn btn-outline-light btn-sm ms-3"
                onClick={() => navigate("/my-reports")}
              >
                Exit Admin Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content-container">
        <div className="container-fluid py-4">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-2 col-md-3">
              <div className="admin-sidebar">
                <div className="list-group admin-nav">
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === "dashboard" ? "active" : ""}`}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <FiPieChart className="icon" /> Dashboard
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                  >
                    <FiUsers className="icon" /> Users
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === "lost" ? "active" : ""}`}
                    onClick={() => setActiveTab("lost")}
                  >
                    <FiAlertTriangle className="icon" /> Lost Items
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === "found" ? "active" : ""}`}
                    onClick={() => setActiveTab("found")}
                  >
                    <FiCheckCircle className="icon" /> Found Items
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === "matches" ? "active" : ""}`}
                    onClick={() => setActiveTab("matches")}
                  >
                    <FiLink className="icon" /> Matches
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="col-lg-10 col-md-9">
              {/* Page Header */}
              <div className="admin-page-header">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">
                    {activeTab === "dashboard" && "System Dashboard"}
                    {activeTab === "users" && "User Management"}
                    {activeTab === "lost" && "Lost Items"}
                    {activeTab === "found" && "Found Items"}
                    {activeTab === "matches" && "Match Management"}
                  </h4>
                  
                  {activeTab !== "dashboard" && (
                    <div className="search-box">
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dashboard */}
              {activeTab === "dashboard" && (
                <div className="dashboard-content">
                  {/* Stats Cards */}
                  <div className="row">
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card admin-stat-card border-left-primary">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="stat-label">Total Users</div>
                              <div className="stat-value">{adminStats.totalUsers || 0}</div>
                            </div>
                            <div className="col-auto">
                              <FiUsers className="stat-icon text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card admin-stat-card border-left-danger">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="stat-label">Lost Items</div>
                              <div className="stat-value">{adminStats.totalLostItems || 0}</div>
                            </div>
                            <div className="col-auto">
                              <FiAlertTriangle className="stat-icon text-danger" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card admin-stat-card border-left-success">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="stat-label">Found Items</div>
                              <div className="stat-value">{adminStats.totalFoundItems || 0}</div>
                            </div>
                            <div className="col-auto">
                              <FiCheckCircle className="stat-icon text-success" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card admin-stat-card border-left-info">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="stat-label">Matches</div>
                              <div className="stat-value">{adminStats.totalMatches || 0}</div>
                            </div>
                            <div className="col-auto">
                              <FiLink className="stat-icon text-info" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* System Overview */}
                  <div className="row">
                    <div className="col-xl-8 col-lg-7">
                      <div className="card mb-4">
                        <div className="card-header">
                          <h5 className="mb-0">System Overview</h5>
                        </div>
                        <div className="card-body">
                          <div className="chart-area">
                            <div className="text-center p-4">
                              <h6 className="mb-3">Lost vs Found Items</h6>
                              <div className="progress" style={{ height: '25px' }}>
                                {(adminStats.totalLostItems || 0) > 0 || (adminStats.totalFoundItems || 0) > 0 ? (
                                  <>
                                    <div 
                                      className="progress-bar bg-danger" 
                                      role="progressbar" 
                                      style={{ 
                                        width: `${(adminStats.totalLostItems / (adminStats.totalLostItems + adminStats.totalFoundItems) * 100) || 0}%` 
                                      }}
                                    >
                                      Lost ({adminStats.totalLostItems || 0})
                                    </div>
                                    <div 
                                      className="progress-bar bg-success" 
                                      role="progressbar" 
                                      style={{ 
                                        width: `${(adminStats.totalFoundItems / (adminStats.totalLostItems + adminStats.totalFoundItems) * 100) || 0}%` 
                                      }}
                                    >
                                      Found ({adminStats.totalFoundItems || 0})
                                    </div>
                                  </>
                                ) : (
                                  <div className="progress-bar bg-secondary" role="progressbar" style={{ width: '100%' }}>
                                    No Data
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h6>Recent Activity</h6>
                              <p>Use the tabs above to view and manage system data.</p>
                              <div className="list-group">
                                <div className="list-group-item">
                                  <div className="d-flex justify-content-between">
                                    <span><FiUsers className="me-2" /> Total Users</span>
                                    <span className="badge bg-primary rounded-pill">{adminStats.totalUsers || 0}</span>
                                  </div>
                                </div>
                                <div className="list-group-item">
                                  <div className="d-flex justify-content-between">
                                    <span><FiAlertTriangle className="me-2" /> Lost Items</span>
                                    <span className="badge bg-danger rounded-pill">{adminStats.totalLostItems || 0}</span>
                                  </div>
                                </div>
                                <div className="list-group-item">
                                  <div className="d-flex justify-content-between">
                                    <span><FiCheckCircle className="me-2" /> Found Items</span>
                                    <span className="badge bg-success rounded-pill">{adminStats.totalFoundItems || 0}</span>
                                  </div>
                                </div>
                                <div className="list-group-item">
                                  <div className="d-flex justify-content-between">
                                    <span><FiLink className="me-2" /> Matches</span>
                                    <span className="badge bg-info rounded-pill">{adminStats.totalMatches || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-4 col-lg-5">
                      <div className="card mb-4">
                        <div className="card-header">
                          <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                          <div className="d-grid gap-3">
                            <button 
                              className="btn btn-primary" 
                              onClick={() => setActiveTab("users")}
                            >
                              <FiUsers className="me-2" /> Manage Users
                            </button>
                            <button 
                              className="btn btn-danger" 
                              onClick={() => setActiveTab("lost")}
                            >
                              <FiAlertTriangle className="me-2" /> View Lost Items
                            </button>
                            <button 
                              className="btn btn-success" 
                              onClick={() => setActiveTab("found")}
                            >
                              <FiCheckCircle className="me-2" /> View Found Items
                            </button>
                            <button 
                              className="btn btn-info text-white" 
                              onClick={() => setActiveTab("matches")}
                            >
                              <FiLink className="me-2" /> Review Matches
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">System Status</h5>
                        </div>
                        <div className="card-body">
                          <div className="list-group">
                            <div className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>Database</span>
                                <span className="badge bg-success">Online</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>Matching Algorithm</span>
                                <span className="badge bg-success">Active</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>Authentication</span>
                                <span className="badge bg-success">Secure</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover admin-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                              <tr key={user.id}>
                                <td>{user.name || user.displayName || "N/A"}</td>
                                <td>{user.email}</td>
                                <td>
                                  <span className={`badge ${user.role === "admin" ? "bg-warning text-dark" : "bg-secondary"}`}>
                                    {user.role || "user"}
                                  </span>
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    value={user.role || "user"}
                                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">No users found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Lost Items Tab */}
              {activeTab === "lost" && (
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover admin-table">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Reported By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLostItems.length > 0 ? (
                            filteredLostItems.map(item => (
                              <tr key={item.id}>
                                <td>{item.document}</td>
                                <td>{item.name || "N/A"}</td>
                                <td>{item.location}</td>
                                <td>{item.dateLost}</td>
                                <td>{item.contact || item.userName || "Anonymous"}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteItem(item.id, "lost")}
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">No lost items found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Found Items Tab */}
              {activeTab === "found" && (
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover admin-table">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Reported By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFoundItems.length > 0 ? (
                            filteredFoundItems.map(item => (
                              <tr key={item.id}>
                                <td>{item.document}</td>
                                <td>{item.name || "N/A"}</td>
                                <td>{item.location}</td>
                                <td>{item.dateFound}</td>
                                <td>{item.contact || item.userName || "Anonymous"}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteItem(item.id, "found")}
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">No found items found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Matches Tab */}
              {activeTab === "matches" && (
                <div className="card">
                  <div className="card-body">
                    {matches.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover admin-table">
                          <thead>
                            <tr>
                              <th>Lost Item</th>
                              <th>Found Item</th>
                              <th>Match Score</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matches.map(match => (
                              <tr key={match.id}>
                                <td>{match.lostItemTitle || match.lostItem?.document || "N/A"}</td>
                                <td>{match.foundItemTitle || match.foundItem?.document || "N/A"}</td>
                                <td>
                                  <div className="progress">
                                    <div
                                      className={`progress-bar ${(match.matchScore || match.score || 0) > 70 ? 'bg-success' : (match.matchScore || match.score || 0) > 40 ? 'bg-warning' : 'bg-danger'}`}
                                      role="progressbar"
                                      style={{ width: `${match.matchScore || match.score || 0}%` }}
                                      aria-valuenow={match.matchScore || match.score || 0}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    >
                                      {match.matchScore || match.score || "N/A"}%
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${match.status === "Confirmed" ? "bg-success" : match.status === "Rejected" ? "bg-danger" : "bg-warning"}`}>
                                    {match.status || "Pending"}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleReviewMatch(match)}
                                  >
                                    <FiEdit /> Review
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="empty-state">
                          <FiLink className="empty-icon" />
                          <h5>No Matches Found</h5>
                          <p>There are currently no matches in the system.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match Review Modal */}
      {showMatchModal && selectedMatch && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Match</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowMatchModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-danger text-white">
                        <h6 className="mb-0">Lost Item</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Document:</strong> {selectedMatch.lostItemTitle || selectedMatch.lostItem?.document || "N/A"}</p>
                        <p><strong>Name:</strong> {selectedMatch.lostItem?.name || "N/A"}</p>
                        <p><strong>Location:</strong> {selectedMatch.lostItem?.location || "N/A"}</p>
                        <p><strong>Date Lost:</strong> {selectedMatch.lostItem?.dateLost || "N/A"}</p>
                        <p><strong>Contact:</strong> {selectedMatch.lostItem?.contact || selectedMatch.lostItem?.userName || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0">Found Item</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Document:</strong> {selectedMatch.foundItemTitle || selectedMatch.foundItem?.document || "N/A"}</p>
                        <p><strong>Name:</strong> {selectedMatch.foundItem?.name || "N/A"}</p>
                        <p><strong>Location:</strong> {selectedMatch.foundItem?.location || "N/A"}</p>
                        <p><strong>Date Found:</strong> {selectedMatch.foundItem?.dateFound || "N/A"}</p>
                        <p><strong>Contact:</strong> {selectedMatch.foundItem?.contact || selectedMatch.foundItem?.userName || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card mt-3">
                  <div className="card-header">
                    <h6 className="mb-0">Match Details</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Match Score</label>
                      <div className="progress" style={{ height: '25px' }}>
                        <div
                          className={`progress-bar ${(selectedMatch.matchScore || selectedMatch.score || 0) > 70 ? 'bg-success' : (selectedMatch.matchScore || selectedMatch.score || 0) > 40 ? 'bg-warning' : 'bg-danger'}`}
                          role="progressbar"
                          style={{ width: `${selectedMatch.matchScore || selectedMatch.score || 0}%` }}
                        >
                          {selectedMatch.matchScore || selectedMatch.score || "N/A"}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Match Criteria</label>
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Document Type Match
                          <span className="badge bg-primary rounded-pill">
                            {selectedMatch.matchReasons?.documentMatch ? "Yes" : "No"}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Name Similarity
                          <span className="badge bg-primary rounded-pill">
                            {selectedMatch.matchReasons?.nameSimilarity || "N/A"}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Location Proximity
                          <span className="badge bg-primary rounded-pill">
                            {selectedMatch.matchReasons?.locationProximity || "N/A"}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Date Consistency
                          <span className="badge bg-primary rounded-pill">
                            {selectedMatch.matchReasons?.dateConsistency || "N/A"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Current Status</label>
                      <span className={`badge ${selectedMatch.status === "Confirmed" ? "bg-success" : selectedMatch.status === "Rejected" ? "bg-danger" : "bg-warning"}`}>
                        {selectedMatch.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowMatchModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => updateMatchStatus(selectedMatch.id, "Rejected")}
                >
                  Reject Match
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => updateMatchStatus(selectedMatch.id, "Confirmed")}
                >
                  Confirm Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showMatchModal && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
}

export default AdminDashboard;