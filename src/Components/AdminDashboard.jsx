import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import "./AdminDashboard.css"; // We'll create this file later

function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-admin users
    if (!currentUser || !isAdmin()) {
      return;
    }

    const db = getDatabase();
    setLoading(true);

    // Fetch users
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key]
        }));
        setUsers(usersArray);
        setStats(prev => ({ ...prev, totalUsers: usersArray.length }));
      }
    });

    // Fetch entries (lost and found items)
    const entriesRef = ref(db, "entries");
    onValue(entriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const entriesData = snapshot.val();
        const entriesArray = Object.keys(entriesData).map(key => ({
          id: key,
          ...entriesData[key]
        }));

        const lostItemsArray = entriesArray.filter(entry => entry.type === "Lost");
        const foundItemsArray = entriesArray.filter(entry => entry.type === "Found");

        setLostItems(lostItemsArray);
        setFoundItems(foundItemsArray);
        setStats(prev => ({
          ...prev,
          totalLostItems: lostItemsArray.length,
          totalFoundItems: foundItemsArray.length
        }));
      }
    });

    // Fetch matches
    const matchesRef = ref(db, "matches");
    onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        const matchesData = snapshot.val();
        const matchesArray = Object.keys(matchesData).map(key => ({
          id: key,
          ...matchesData[key]
        }));
        setMatches(matchesArray);
        setStats(prev => ({ ...prev, totalMatches: matchesArray.length }));
      }
      setLoading(false);
    });
  }, [currentUser, isAdmin]);

  // Function to delete an item
  const handleDeleteItem = (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} item?`)) {
      return;
    }

    const db = getDatabase();
    const itemRef = ref(db, `entries/${id}`);
    
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
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    
    update(userRef, { role: newRole })
      .then(() => {
        alert("User role updated successfully!");
      })
      .catch(error => {
        console.error("Error updating user role:", error);
        alert("Failed to update user role. Please try again.");
      });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="admin-unauthorized">
        <div className="alert alert-danger">
          <h3>Unauthorized Access</h3>
          <p>You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container py-4">
        <h1 className="text-center mb-4">Admin Dashboard</h1>
        
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "lost" ? "active" : ""}`}
              onClick={() => setActiveTab("lost")}
            >
              Lost Items
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "found" ? "active" : ""}`}
              onClick={() => setActiveTab("found")}
            >
              Found Items
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "matches" ? "active" : ""}`}
              onClick={() => setActiveTab("matches")}
            >
              Matches
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {/* Dashboard Statistics Tab */}
          {activeTab === "dashboard" && (
            <div className="tab-pane active">
              <div className="row">
                <div className="col-md-3 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Total Users</h5>
                      <h2 className="display-4">{stats.totalUsers}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-danger text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Lost Items</h5>
                      <h2 className="display-4">{stats.totalLostItems}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Found Items</h5>
                      <h2 className="display-4">{stats.totalFoundItems}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Matches</h5>
                      <h2 className="display-4">{stats.totalMatches}</h2>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      System Overview
                    </div>
                    <div className="card-body">
                      <h5>Recent Activity</h5>
                      <p>This dashboard gives you a complete overview of the lost and found system.</p>
                      <ul>
                        <li>Manage users and their roles</li>
                        <li>View and manage all lost and found items</li>
                        <li>Review AI-generated matches</li>
                        <li>Track system performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="tab-pane active">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Users Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lost Items Tab */}
          {activeTab === "lost" && (
            <div className="tab-pane active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Lost Items</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
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
                        {lostItems.map(item => (
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
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Found Items Tab */}
          {activeTab === "found" && (
            <div className="tab-pane active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Found Items</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
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
                        {foundItems.map(item => (
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
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === "matches" && (
            <div className="tab-pane active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">AI Matches</h5>
                </div>
                <div className="card-body">
                  {matches.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
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
                                <span className="badge bg-success">
                                  {match.matchScore || match.score || "N/A"}
                                </span>
                              </td>
                              <td>{match.status || "Pending"}</td>
                              <td>
                                <button className="btn btn-sm btn-primary me-2">
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p>No matches found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;