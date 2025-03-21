// src/Components/MyReports.jsx
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useAuth } from "./AuthContext";

function MyReports() {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "lost", "found", "matches"
  const [lostItemMatches, setLostItemMatches] = useState([]);
  const [foundItemMatches, setFoundItemMatches] = useState([]);
  const [matchesSubTab, setMatchesSubTab] = useState("myLost"); // "myLost", "myFound"
  const { currentUser, isAdmin } = useAuth();
  const database = getDatabase();
  
  // Safely check if user is admin
  const userIsAdmin = currentUser && isAdmin && isAdmin();

  useEffect(() => {
    const entriesRef = ref(database, "entries");
    
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const entriesArray = Object.entries(data).map(([key, value]) => {
          return { ...value, dbKey: key };
        });
        
        // If admin, get all reports, otherwise filter for current user
        const userReports = userIsAdmin 
          ? entriesArray 
          : entriesArray.filter(entry => entry.email === currentUser.email);
        
        setMyReports(userReports);
        
        // Process matches for both lost and found items
        if (entriesArray.length > 0) {
          // Get all lost and found items
          const allLostItems = entriesArray.filter(item => item.type === "Lost");
          const allFoundItems = entriesArray.filter(item => item.type === "Found");
          
          // Get user's lost and found items
          const userLostItems = entriesArray.filter(
            item => item.type === "Lost" && item.email === currentUser.email
          );
          
          const userFoundItems = entriesArray.filter(
            item => item.type === "Found" && item.email === currentUser.email
          );
          
          // For admin: match all lost items with all found items
          // For user: match user's lost items with all found items
          const lostMatches = userIsAdmin 
            ? findMatchesBetween(allLostItems, allFoundItems)
            : findMatchesBetween(userLostItems, allFoundItems);
            
          // For admin: same as above (already covered)
          // For user: match user's found items with all lost items
          const foundMatches = userIsAdmin 
            ? [] // Not needed for admin as they see all matches in lostMatches
            : findMatchesBetween(allLostItems.filter(item => 
                item.email !== currentUser.email
              ), 
              userFoundItems
            );
            
          setLostItemMatches(lostMatches);
          setFoundItemMatches(foundMatches);
        }
      } else {
        setMyReports([]);
        setLostItemMatches([]);
        setFoundItemMatches([]);
      }
      setLoading(false);
    });
  }, [currentUser.email, database, userIsAdmin]);

  // Find matches between lost and found items
  const findMatchesBetween = (lostItems, foundItems) => {
    const matchedResults = [];
    
    if (lostItems.length === 0 || foundItems.length === 0) {
      return matchedResults;
    }
    
    lostItems.forEach(lostItem => {
      foundItems.forEach(foundItem => {
        let score = 0;
        
        // Check document type match
        if (lostItem.document === foundItem.document) {
          score += 3;
        }
        
        // Check name similarity if both have names
        if (lostItem.name && foundItem.name) {
          const nameSimilarity = stringSimilarity(lostItem.name, foundItem.name);
          if (nameSimilarity > 0.3) {
            score += nameSimilarity * 4;
          }
        }
        
        // Check location similarity
        const locationSimilarity = stringSimilarity(
          lostItem.location || "",
          foundItem.location || ""
        );
        if (locationSimilarity > 0.3) {
          score += locationSimilarity * 2;
        }
        
        // Only add if score is high enough
        if (score >= 3) {
          matchedResults.push({
            lostItem,
            foundItem,
            matchScore: score.toFixed(1),
            reasons: getMatchReasons(lostItem, foundItem)
          });
        }
      });
    });
    
    // Sort by score (highest first)
    return matchedResults.sort((a, b) => 
      parseFloat(b.matchScore) - parseFloat(a.matchScore)
    );
  };

  // String similarity function
  const stringSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    // Convert to lowercase and split into words
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    // Calculate intersection
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    
    // Calculate Jaccard similarity coefficient
    return intersection.size / (set1.size + set2.size - intersection.size);
  };

  // Generate match reasons
  const getMatchReasons = (lostItem, foundItem) => {
    const reasons = [];
    
    if (lostItem.document === foundItem.document) {
      reasons.push("Same document type");
    }
    
    if (foundItem.name && lostItem.name) {
      const nameSimilarity = stringSimilarity(lostItem.name, foundItem.name);
      if (nameSimilarity > 0.3) {
        reasons.push("Similar names");
      }
    }
    
    const locationSimilarity = stringSimilarity(
      lostItem.location || "", 
      foundItem.location || ""
    );
    if (locationSimilarity > 0.3) {
      reasons.push("Similar locations");
    }
    
    if (lostItem.dateLost && foundItem.dateFound) {
      const lostDate = new Date(lostItem.dateLost);
      const foundDate = new Date(foundItem.dateFound);
      
      if (!isNaN(lostDate) && !isNaN(foundDate)) {
        const diffDays = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);
        if (diffDays <= 14) {
          reasons.push("Dates are close");
        }
      }
    }
    
    return reasons;
  };

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

  // Check if a report has matches
  const hasMatches = (report) => {
    if (report.type === "Lost") {
      return lostItemMatches.some(match => match.lostItem.dbKey === report.dbKey);
    } else {
      return foundItemMatches.some(match => match.foundItem.dbKey === report.dbKey);
    }
  };

  // Get match count for a specific report
  const getMatchCount = (report) => {
    if (report.type === "Lost") {
      return lostItemMatches.filter(match => match.lostItem.dbKey === report.dbKey).length;
    } else {
      return foundItemMatches.filter(match => match.foundItem.dbKey === report.dbKey).length;
    }
  };

  // Filter reports based on active tab
  const filteredReports = myReports.filter(report => {
    if (activeTab === "all") return true;
    if (activeTab === "matches") return hasMatches(report);
    return report.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="container py-5 mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">
                {userIsAdmin ? "All Reports" : "My Reports"}
              </h3>
              {userIsAdmin && (
                <span className="badge bg-warning text-dark">Admin View</span>
              )}
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading reports...</p>
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
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === "matches" ? "active" : ""}`}
                        onClick={() => setActiveTab("matches")}
                      >
                        Matches
                        <span className="badge bg-info ms-1">
                          {lostItemMatches.length + foundItemMatches.length}
                        </span>
                      </button>
                    </li>
                  </ul>

                  {activeTab === "matches" ? (
                    <div className="matches-container">
                      {/* Conditional UI based on user role */}
                      {userIsAdmin ? (
                        // ADMIN VIEW - Show all matches in one unified view
                        <>
                          <h4 className="mb-4">System-Wide Match Analysis</h4>
                          <p className="text-center mb-4">
                            There are {lostItemMatches.length} potential matches in the system.
                          </p>
                          
                          {lostItemMatches.length > 0 ? (
                            lostItemMatches.map((match, index) => (
                              <div key={index} className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                  <h5 className="mb-0">Potential Match #{index + 1}</h5>
                                  <span className="badge bg-success">Match Score: {match.matchScore}</span>
                                </div>
                                <div className="card-body">
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="border rounded p-3 bg-light mb-3">
                                        <h5 className="text-danger d-flex justify-content-between">
                                          <span>Lost Item</span>
                                          <small className="text-muted">({match.lostItem.email})</small>
                                        </h5>
                                        <p><strong>Document:</strong> {match.lostItem.document}</p>
                                        <p><strong>Name:</strong> {match.lostItem.name || "N/A"}</p>
                                        <p><strong>Location:</strong> {match.lostItem.location}</p>
                                        <p><strong>Date Lost:</strong> {match.lostItem.dateLost || "N/A"}</p>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="border rounded p-3 bg-light">
                                        <h5 className="text-success d-flex justify-content-between">
                                          <span>Found Item</span>
                                          <small className="text-muted">({match.foundItem.email})</small>
                                        </h5>
                                        <p><strong>Document:</strong> {match.foundItem.document}</p>
                                        <p><strong>Name:</strong> {match.foundItem.name || "(Not visible/provided)"}</p>
                                        <p><strong>Location:</strong> {match.foundItem.location}</p>
                                        <p><strong>Date Found:</strong> {match.foundItem.dateFound || "N/A"}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <h6>Match Reasons:</h6>
                                    <div>
                                      {match.reasons.map((reason, i) => (
                                        <span key={i} className="badge bg-info text-dark me-2 mb-2">{reason}</span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 text-center">
                                    <button className="btn btn-primary me-2">
                                      <i className="bi bi-envelope me-1"></i> Notify Both Parties
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                      <i className="bi bi-x-circle me-1"></i> Dismiss Match
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-5 bg-light rounded">
                              <i className="bi bi-search" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                              <h4 className="mt-3">No Matches Found in System</h4>
                              <p>There are currently no potential matches between lost and found items.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        // REGULAR USER VIEW - Show tabs for my lost vs my found
                        <>
                          {/* New sub-tabs for matches */}
                          <div className="d-flex justify-content-center mb-4">
                            <div 
                              className={`btn ${matchesSubTab === "myLost" ? "btn-primary" : "btn-outline-primary"} me-3`}
                              onClick={() => setMatchesSubTab("myLost")}
                            >
                              <i className="bi bi-search"></i> Matches for My Lost Items
                              <span className="badge bg-danger ms-2">{lostItemMatches.length}</span>
                            </div>
                            <div 
                              className={`btn ${matchesSubTab === "myFound" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setMatchesSubTab("myFound")}
                            >
                              <i className="bi bi-award"></i> Matches for My Found Items
                              <span className="badge bg-success ms-2">{foundItemMatches.length}</span>
                            </div>
                          </div>
                          
                          {matchesSubTab === "myLost" ? (
                            <>
                              <p className="text-center mb-4">We found {lostItemMatches.length} potential matches for items you've lost.</p>
                              
                              {lostItemMatches.length > 0 ? (
                                lostItemMatches.map((match, index) => (
                                  <div key={index} className="card mb-4">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                      <h5 className="mb-0">Potential Match #{index + 1}</h5>
                                      <span className="badge bg-success">Match Score: {match.matchScore}</span>
                                    </div>
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="border rounded p-3 bg-light mb-3">
                                            <h5 className="text-danger">Your Lost Item</h5>
                                            <p><strong>Document:</strong> {match.lostItem.document}</p>
                                            <p><strong>Name:</strong> {match.lostItem.name || "N/A"}</p>
                                            <p><strong>Location:</strong> {match.lostItem.location}</p>
                                            <p><strong>Date Lost:</strong> {match.lostItem.dateLost || "N/A"}</p>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="border rounded p-3 bg-light">
                                            <h5 className="text-success">Someone Found</h5>
                                            <p><strong>Document:</strong> {match.foundItem.document}</p>
                                            <p><strong>Name:</strong> {match.foundItem.name || "(Not visible/provided)"}</p>
                                            <p><strong>Location:</strong> {match.foundItem.location}</p>
                                            <p><strong>Date Found:</strong> {match.foundItem.dateFound || "N/A"}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3">
                                        <h6>Match Reasons:</h6>
                                        <div>
                                          {match.reasons.map((reason, i) => (
                                            <span key={i} className="badge bg-info text-dark me-2 mb-2">{reason}</span>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-center">
                                        <button className="btn btn-primary">
                                          <i className="bi bi-chat-dots me-1"></i> Contact Finder
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center p-5 bg-light rounded">
                                  <i className="bi bi-search" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                                  <h4 className="mt-3">No Matches For Your Lost Items</h4>
                                  <p>We couldn't find any potential matches for your lost items yet.</p>
                                  <p>Check back later as more items are reported.</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-center mb-4">We found {foundItemMatches.length} potential matches for items you've found.</p>
                              
                              {foundItemMatches.length > 0 ? (
                                foundItemMatches.map((match, index) => (
                                  <div key={index} className="card mb-4">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                      <h5 className="mb-0">Potential Match #{index + 1}</h5>
                                      <span className="badge bg-success">Match Score: {match.matchScore}</span>
                                    </div>
                                    <div className="card-body">
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="border rounded p-3 bg-light mb-3">
                                            <h5 className="text-danger">Someone Lost</h5>
                                            <p><strong>Document:</strong> {match.lostItem.document}</p>
                                            <p><strong>Name:</strong> {match.lostItem.name || "N/A"}</p>
                                            <p><strong>Location:</strong> {match.lostItem.location}</p>
                                            <p><strong>Date Lost:</strong> {match.lostItem.dateLost || "N/A"}</p>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="border rounded p-3 bg-light">
                                            <h5 className="text-success">Your Found Item</h5>
                                            <p><strong>Document:</strong> {match.foundItem.document}</p>
                                            <p><strong>Name:</strong> {match.foundItem.name || "(Not visible/provided)"}</p>
                                            <p><strong>Location:</strong> {match.foundItem.location}</p>
                                            <p><strong>Date Found:</strong> {match.foundItem.dateFound || "N/A"}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3">
                                        <h6>Match Reasons:</h6>
                                        <div>
                                          {match.reasons.map((reason, i) => (
                                            <span key={i} className="badge bg-info text-dark me-2 mb-2">{reason}</span>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-center">
                                        <button className="btn btn-danger">
                                          <i className="bi bi-chat-dots me-1"></i> Contact Owner
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center p-5 bg-light rounded">
                                  <i className="bi bi-award" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                                  <h4 className="mt-3">No Matches For Your Found Items</h4>
                                  <p>We couldn't find any potential matches for the items you've found yet.</p>
                                  <p>Check back later as more lost items are reported.</p>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredReports.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-inbox display-1 text-muted"></i>
                          <h4 className="mt-3">No Reports Found</h4>
                          <p className="text-muted">
                            {userIsAdmin
                              ? "There are no reports in the system yet."
                              : `You haven't created any ${activeTab !== "all" ? activeTab : ""} reports yet.`}
                          </p>
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
                                {userIsAdmin && <th>Reported By</th>}
                                <th>Matches</th>
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
                                  {userIsAdmin && <td>{report.email}</td>}
                                  <td>
                                    {hasMatches(report) ? (
                                      <span className="badge bg-info">
                                        {getMatchCount(report)} potential {getMatchCount(report) === 1 ? 'match' : 'matches'}
                                      </span>
                                    ) : (
                                      <span className="badge bg-secondary">No matches</span>
                                    )}
                                  </td>
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
                                      {hasMatches(report) && (
                                        <button
                                          className="btn btn-info"
                                          onClick={() => {
                                            setActiveTab("matches");
                                            setMatchesSubTab(report.type === "Lost" ? "myLost" : "myFound");
                                          }}
                                        >
                                          <i className="bi bi-link"></i>
                                        </button>
                                      )}
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
                  {hasMatches(selectedEntry) && (
                    <span className="badge bg-info ms-2">
                      {getMatchCount(selectedEntry)} potential {getMatchCount(selectedEntry) === 1 ? 'match' : 'matches'}
                    </span>
                  )}
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
                {hasMatches(selectedEntry) && (
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => {
                      handleCloseDetails();
                      setActiveTab("matches");
                      setMatchesSubTab(selectedEntry.type === "Lost" ? "myLost" : "myFound");
                    }}
                  >
                    View Matches
                  </button>
                )}
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