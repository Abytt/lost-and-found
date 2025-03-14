import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

const database = getDatabase(app);

function LostFound() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "lost", "found", "matches"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const entriesRef = ref(database, "entries");
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        setEntries(entriesArray);
        
        // Run matching algorithm when data is loaded
        runMatchingAlgorithm(entriesArray);
      }
      setLoading(false);
    });
  }, []);

  // AI Matching Logic
  const runMatchingAlgorithm = (entriesArray) => {
    const lostItems = entriesArray.filter(item => item.type === "Lost");
    const foundItems = entriesArray.filter(item => item.type === "Found");
    
    if (lostItems.length > 0 && foundItems.length > 0) {
      const matchedResults = [];
  
      lostItems.forEach((lostItem) => {
        foundItems.forEach((foundItem) => {
          let score = 0;
  
          // Check document type match
          if (lostItem.document === foundItem.document) {
            score += 3; // Higher weight for exact document type match
          }
  
          // Check name similarity (if name exists on found item)
          if (foundItem.name && lostItem.name) {
            const nameSimilarity = stringSimilarity(lostItem.name, foundItem.name);
            if (nameSimilarity > 0.3) { // Lower threshold since names might be partially visible
              score += nameSimilarity * 4; // Give even more weight to name match
            }
          }
  
          // Check location similarity
          const locationSimilarity = stringSimilarity(lostItem.location, foundItem.location);
          if (locationSimilarity > 0.3) {
            score += locationSimilarity * 2;
          }
  
          // Check geo proximity if coordinates exist
          if (lostItem.lat && lostItem.lon && foundItem.lat && foundItem.lon) {
            const distance = getDistance(
              lostItem.lat, lostItem.lon, 
              foundItem.lat, foundItem.lon
            );
            
            if (distance < 5) { // Within 5km
              score += 3;
            } else if (distance < 10) { // Within 10km
              score += 1.5;
            }
          }
  
          // Check recent time match (using the date fields from your forms)
          if (isRecentMatch(lostItem.dateLost, foundItem.dateFound)) {
            score += 2;
          }
  
          // Store match if score is high enough
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
  
      // Sort matches by score (highest first)
      matchedResults.sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore));
      setMatches(matchedResults);
    }
  };

  // Generate human-readable match reasons
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
    
    const locationSimilarity = stringSimilarity(lostItem.location, foundItem.location);
    if (locationSimilarity > 0.3) {
      reasons.push("Similar locations");
    }
    
    if (lostItem.lat && lostItem.lon && foundItem.lat && foundItem.lon) {
      const distance = getDistance(
        lostItem.lat, lostItem.lon, 
        foundItem.lat, foundItem.lon
      );
      
      if (distance < 10) {
        reasons.push(`Locations are ${distance.toFixed(1)}km apart`);
      }
    }
    
    if (isRecentMatch(lostItem.dateLost, foundItem.dateFound)) {
      reasons.push("Dates are close");
    }
    
    return reasons;
  };

  // Function to calculate string similarity (Jaccard Similarity)
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

  // Function to calculate distance between coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to check if two dates are within a recent range (e.g., 14 days)
  const isRecentMatch = (dateLost, dateFound) => {
    if (!dateLost || !dateFound) return false;
    
    const lostDate = new Date(dateLost);
    const foundDate = new Date(dateFound);
    
    // Check if dates are valid
    if (isNaN(lostDate.getTime()) || isNaN(foundDate.getTime())) {
      return false;
    }
    
    // Calculate the absolute difference in days
    const diffTime = Math.abs(foundDate - lostDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 14; // Consider recent if within 14 days
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "auto",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  };

  const headerStyle = {
    textAlign: "center",
    color: "#333",
    marginBottom: "30px",
  };

  const tabContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #ddd",
  };

  const tabStyle = {
    padding: "10px 20px",
    cursor: "pointer",
    margin: "0 10px",
    borderRadius: "5px 5px 0 0",
    fontWeight: "bold",
  };

  const activeTabStyle = {
    ...tabStyle,
    background: "#f0f0f0",
    borderBottom: "3px solid #007bff",
  };

  const flexContainer = {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  };

  const columnStyle = {
    flex: 1,
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  };

  const thStyle = {
    background: "#f4f4f4",
    fontWeight: "bold",
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9'
  };

  const matchHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const scoreStyle = {
    padding: '5px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    color: 'white'
  };

  const itemCardStyle = {
    border: '1px solid #eee',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: 'white'
  };

  const reasonTagStyle = {
    display: 'inline-block',
    backgroundColor: '#e0f7fa',
    borderRadius: '20px',
    padding: '3px 10px',
    margin: '0 5px 5px 0',
    fontSize: '12px'
  };

  const badgeStyle = {
    fontSize: "12px",
    padding: "3px 8px",
    borderRadius: "10px",
    fontWeight: "bold",
    marginLeft: "5px",
  };

  const lostBadgeStyle = {
    ...badgeStyle,
    backgroundColor: "#ff6b6b",
    color: "white",
  };

  const foundBadgeStyle = {
    ...badgeStyle,
    backgroundColor: "#51cf66",
    color: "white",
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading entries...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "all":
        return (
          <div style={flexContainer}>
            {/* Lost Items (Left Side) */}
            <div style={columnStyle}>
              <h2 style={{ color: "#d9534f" }}>Lost Items</h2>
              {entries.filter((entry) => entry.type === "Lost").length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .filter((entry) => entry.type === "Lost")
                      .map((entry) => (
                        <tr key={entry.id}>
                          <td style={thTdStyle}>{entry.document}</td>
                          <td style={thTdStyle}>{entry.name}</td>
                          <td style={thTdStyle}>{entry.location}</td>
                          <td style={thTdStyle}>{entry.contact}</td>
                          <td style={thTdStyle}>
                            <button
                              style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                              onClick={() => handleViewDetails(entry)}
                            >
                              More Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p>No lost items found.</p>
              )}
            </div>

            {/* Found Items (Right Side) */}
            <div style={columnStyle}>
              <h2 style={{ color: "#5cb85c" }}>Found Items</h2>
              {entries.filter((entry) => entry.type === "Found").length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .filter((entry) => entry.type === "Found")
                      .map((entry) => (
                        <tr key={entry.id}>
                          <td style={thTdStyle}>{entry.document}</td>
                          <td style={thTdStyle}>{entry.name || "N/A"}</td>
                          <td style={thTdStyle}>{entry.location}</td>
                          <td style={thTdStyle}>{entry.contact}</td>
                          <td style={thTdStyle}>
                            <button
                              style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                              onClick={() => handleViewDetails(entry)}
                            >
                              More Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p>No found items available.</p>
              )}
            </div>
          </div>
        );
      case "lost":
        return (
          <div style={columnStyle}>
            <h2 style={{ color: "#d9534f" }}>Lost Items</h2>
            {entries.filter((entry) => entry.type === "Lost").length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Date Lost</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((entry) => entry.type === "Lost")
                    .map((entry) => (
                      <tr key={entry.id}>
                        <td style={thTdStyle}>{entry.document}</td>
                        <td style={thTdStyle}>{entry.name}</td>
                        <td style={thTdStyle}>{entry.dateLost}</td>
                        <td style={thTdStyle}>{entry.location}</td>
                        <td style={thTdStyle}>{entry.contact}</td>
                        <td style={thTdStyle}>
                          <button
                            style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                            onClick={() => handleViewDetails(entry)}
                          >
                            More Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>No lost items found.</p>
            )}
          </div>
        );
      case "found":
        return (
          <div style={columnStyle}>
            <h2 style={{ color: "#5cb85c" }}>Found Items</h2>
            {entries.filter((entry) => entry.type === "Found").length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Date Found</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((entry) => entry.type === "Found")
                    .map((entry) => (
                      <tr key={entry.id}>
                        <td style={thTdStyle}>{entry.document}</td>
                        <td style={thTdStyle}>{entry.name || "N/A"}</td>
                        <td style={thTdStyle}>{entry.dateFound}</td>
                        <td style={thTdStyle}>{entry.location}</td>
                        <td style={thTdStyle}>{entry.contact}</td>
                        <td style={thTdStyle}>
                          <button
                            style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                            onClick={() => handleViewDetails(entry)}
                          >
                            More Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>No found items available.</p>
            )}
          </div>
        );
      case "matches":
        return matches.length > 0 ? (
          <div>
            <h2 className="text-center mb-4">AI-Based Lost & Found Matching</h2>
            <p className="text-center mb-4">Our system found {matches.length} potential matches based on intelligent analysis.</p>
            
            {matches.map((match, index) => (
              <div key={index} style={cardStyle}>
                <div style={matchHeaderStyle}>
                  <h4>Potential Match #{index + 1}</h4>
                  <span style={scoreStyle}>Match Score: {match.matchScore}</span>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div style={itemCardStyle}>
                      <h5 className="text-danger">Lost Item</h5>
                      <p><strong>Document:</strong> {match.lostItem.document}</p>
                      <p><strong>Name:</strong> {match.lostItem.name}</p>
                      <p><strong>Location:</strong> {match.lostItem.location}</p>
                      <p><strong>Date Lost:</strong> {match.lostItem.dateLost}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div style={itemCardStyle}>
                      <h5 className="text-success">Found Item</h5>
                      <p><strong>Document:</strong> {match.foundItem.document}</p>
                      <p><strong>Name:</strong> {match.foundItem.name || "(Not visible/provided)"}</p>
                      <p><strong>Location:</strong> {match.foundItem.location}</p>
                      <p><strong>Date Found:</strong> {match.foundItem.dateFound}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h6>Match Reasons:</h6>
                  <div>
                    {match.reasons.map((reason, i) => (
                      <span key={i} style={reasonTagStyle}>{reason}</span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <button className="btn btn-primary me-2">Contact Owner</button>
                  <button className="btn btn-outline-secondary">Not a Match</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-5 bg-light rounded">
            <i className="bi bi-search" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <h4 className="mt-3">No Potential Matches Found</h4>
            <p>Our system couldn't find any matches between lost and found items at this time.</p>
            <p>Please check back later as new items are reported.</p>
          </div>
        );
      default:
        return <div>Invalid tab selected</div>;
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Lost & Found System</h1>

      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <div 
          style={activeTab === "all" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("all")}
        >
          All Items
        </div>
        <div 
          style={activeTab === "lost" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("lost")}
        >
          Lost Items
          <span style={lostBadgeStyle}>
            {entries.filter(entry => entry.type === "Lost").length}
          </span>
        </div>
        <div 
          style={activeTab === "found" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("found")}
        >
          Found Items
          <span style={foundBadgeStyle}>
            {entries.filter(entry => entry.type === "Found").length}
          </span>
        </div>
        <div 
          style={activeTab === "matches" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("matches")}
        >
          AI Matches
          <span style={{
            ...badgeStyle,
            backgroundColor: "#339af0",
            color: "white",
          }}>
            {matches.length}
          </span>
        </div>
      </div>

      {/* Content based on selected tab */}
      {renderContent()}

      {/* Detailed View Modal */}
      {selectedEntry && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedEntry.type} Item Details
                  <span style={selectedEntry.type === "Lost" ? lostBadgeStyle : foundBadgeStyle}>
                    {selectedEntry.type}
                  </span>
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                <p><strong>Document Type:</strong> {selectedEntry.document}</p>
                <p><strong>Name:</strong> {selectedEntry.name || "Not provided/visible"}</p>
                <p><strong>Location:</strong> {selectedEntry.location}</p>
                <p><strong>Date:</strong> {selectedEntry.type === "Lost" ? selectedEntry.dateLost : selectedEntry.dateFound}</p>
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>Close</button>
                {selectedEntry.type === "Found" && (
                  <button type="button" className="btn btn-primary">
                    I Lost This Item
                  </button>
                )}
                {selectedEntry.type === "Lost" && (
                  <button type="button" className="btn btn-success">
                    I Found This Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LostFound;