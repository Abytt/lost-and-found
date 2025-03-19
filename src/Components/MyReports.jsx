// src/Components/MyReports.jsx
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useAuth } from "./AuthContext"; // Updated import path

function MyReports() {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "lost", "found"
  const { currentUser } = useAuth();
  const database = getDatabase();

  useEffect(() => {
    const entriesRef = ref(database, "entries");
    
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and filter for current user's reports
        const entriesArray = Object.entries(data).map(([key, value]) => {
          return { ...value, dbKey: key };
        });
        
        // Filter reports where the user email matches the current user's email
        const userReports = entriesArray.filter(entry => 
          entry.email === currentUser.email
        );
        
        setMyReports(userReports);
      } else {
        setMyReports([]);
      }
      setLoading(false);
    });
  }, [currentUser.email, database]);

  const handleDeleteReport = async (reportKey) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const reportRef = ref(database, `entries/${reportKey}`);
        await remove(reportRef);
        // The real-time listener will automatically update the UI
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Failed to delete report. Please try again.");
      }
    }
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  // Filter reports based on active tab
  const filteredReports = myReports.filter(report => {
    if (activeTab === "all") return true;
    return report.type.toLowerCase() === activeTab;
  });

  return (
    <div className="container py-5 mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">My Reports</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your reports...</p>
                </div>
              ) : (
                <>
                  {/* Tab Navigation */}
                  <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                      >
                        All Reports 
                        <span className="badge bg-secondary ms-1">
                          {myReports.length}
                        </span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === "lost" ? "active" : ""}`}
                        onClick={() => setActiveTab("lost")}
                      >
                        Lost Items
                        <span className="badge bg-danger ms-1">
                          {myReports.filter(r => r.type === "Lost").length}
                        </span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === "found" ? "active" : ""}`}
                        onClick={() => setActiveTab("found")}
                      >
                        Found Items
                        <span className="badge bg-success ms-1">
                          {myReports.filter(r => r.type === "Found").length}
                        </span>
                      </button>
                    </li>
                  </ul>

                  {filteredReports.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox display-1 text-muted"></i>
                      <h4 className="mt-3">No Reports Found</h4>
                      <p className="text-muted">You haven't created any {activeTab !== "all" ? activeTab : ""} reports yet.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Document</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => (
                            <tr key={report.dbKey}>
                              <td>
                                <span 
                                  className={`badge ${
                                    report.type === "Lost" ? "bg-danger" : "bg-success"
                                  }`}
                                >
                                  {report.type}
                                </span>
                              </td>
                              <td>{report.document}</td>
                              <td>{report.name || "N/A"}</td>
                              <td>
                                {report.type === "Lost" 
                                  ? report.dateLost 
                                  : report.dateFound}
                              </td>
                              <td>{report.location}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleViewDetails(report)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteReport(report.dbKey)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedEntry.type} Item Details
                  <span className={`badge ms-2 ${
                    selectedEntry.type === "Lost" ? "bg-danger" : "bg-success"
                  }`}>
                    {selectedEntry.type}
                  </span>
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                <p><strong>Document Type:</strong> {selectedEntry.document}</p>
                <p><strong>Name:</strong> {selectedEntry.name || "Not provided/visible"}</p>
                <p><strong>Location:</strong> {selectedEntry.location}</p>
                <p><strong>Date:</strong> {selectedEntry.type === "Lost" 
                  ? selectedEntry.dateLost 
                  : selectedEntry.dateFound}
                </p>
                <p><strong>Contact:</strong> {selectedEntry.contact}</p>
                <p><strong>Email:</strong> {selectedEntry.email}</p>
                {selectedEntry.type === "Lost" && selectedEntry.additionalDetails && (
                  <p><strong>Additional Details:</strong> {selectedEntry.additionalDetails}</p>
                )}
                {selectedEntry.type === "Found" && selectedEntry.description && (
                  <p><strong>Description:</strong> {selectedEntry.description}</p>
                )}
                {selectedEntry.type === "Found" && selectedEntry.currentLocation && (
                  <p><strong>Current Location:</strong> {selectedEntry.currentLocation}</p>
                )}
                {selectedEntry.lat && selectedEntry.lon && (
                  <p><strong>GPS Coordinates:</strong> {selectedEntry.lat.toFixed(6)}, {selectedEntry.lon.toFixed(6)}</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    handleCloseDetails();
                    handleDeleteReport(selectedEntry.dbKey);
                  }}
                >
                  Delete Report
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReports;