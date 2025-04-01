import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { app } from "../firebase";
import { useAuth } from "./AuthContext"; 

const database = getDatabase(app);

function LostFound() {
  const { currentUser, isAdmin } = useAuth();
  // Safely check if user is admin
  const userIsAdmin = currentUser && isAdmin && isAdmin();
  
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [lostItemMatches, setLostItemMatches] = useState([]);
  const [foundItemMatches, setFoundItemMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "lost", "found", "matches"
  const [matchesSubTab, setMatchesSubTab] = useState("myLost"); // "myLost", "myFound"
  const [loading, setLoading] = useState(true);

  // Define all styles
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

  const subtabStyle = {
    padding: "10px 20px",
    cursor: "pointer",
    margin: "0 10px",
    borderRadius: "5px",
    fontWeight: "bold",
    border: "1px solid #ddd",
    backgroundColor: "#f8f9fa"
  };

  const activeSubtabStyle = {
    ...subtabStyle,
    backgroundColor: "#e9ecef",
    borderColor: "#dee2e6",
    boxShadow: "inset 0 3px 5px rgba(0, 0, 0, 0.125)"
  };

  useEffect(() => {
    // Only proceed if user is logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const entriesRef = ref(database, "entries");
    
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array with proper keys
        const entriesArray = Object.entries(data).map(([key, value]) => ({
          ...value,
          id: key // Ensure each entry has an id
        }));
        
        // Filter entries based on user role
        let filteredEntries = entriesArray;
        if (!userIsAdmin) {
          // Regular users can only see their own entries
          filteredEntries = entriesArray.filter(entry => 
            entry.userId === currentUser.uid || entry.email === currentUser.email
          );
        }
        
        setEntries(filteredEntries);
        
        // Run matching for both lost and found items
        const allLostItems = entriesArray.filter(item => item.type === "Lost");
        const allFoundItems = entriesArray.filter(item => item.type === "Found");
        
        // Get user's lost and found items
        const userLostItems = entriesArray.filter(
          item => item.type === "Lost" && 
          (item.userId === currentUser.uid || item.email === currentUser.email)
        );
        
        const userFoundItems = entriesArray.filter(
          item => item.type === "Found" && 
          (item.userId === currentUser.uid || item.email === currentUser.email)
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
              !(item.userId === currentUser.uid || item.email === currentUser.email)
            ), 
            userFoundItems
          );
          
        setLostItemMatches(lostMatches);
        setFoundItemMatches(foundMatches);
      }
      setLoading(false);
    });
  }, [currentUser, userIsAdmin]);

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

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  const handleContactPerson = async (match, type) => {
    try {
      const item = type === 'finder' ? match.foundItem : match.lostItem;
      const newMessage = {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: item.userId,
        recipientEmail: item.email,
        itemId: item.id,
        itemType: type === 'finder' ? 'Found' : 'Lost',
        itemName: item.document,
        // Only include location if it exists
        ...(item.location && { itemLocation: item.location }),
        message: `Hello, I am contacting you regarding the ${type === 'finder' ? 'found' : 'lost'} ${item.document}.`,
        timestamp: Date.now(),
        status: 'pending',
        read: false
      };
  
      await push(ref(database, 'messages'), newMessage);
      alert('Contact request sent successfully!');
    } catch (error) {
      console.error('Error sending contact request:', error);
      alert('Failed to send contact request. Please try again.');
    }
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

    // Check if user is logged in
    if (!currentUser) {
      return (
        <div className="text-center p-5">
          <h3>Please log in to view lost and found items</h3>
          <p>You need to be logged in to access this feature.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "all":
        return (
          <div style={flexContainer}>
            {/* Lost Items (Left Side) */}
            <div style={columnStyle}>
              <h2 style={{ color: "#d9534f" }}>
                {userIsAdmin ? "All Lost Items" : "My Lost Items"}
              </h2>
              {entries.filter((entry) => entry.type === "Lost").length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .filter((entry) => entry.type === "Lost")
                      .map((entry) => (
                        <tr key={entry.id || Math.random().toString()}>
                          <td style={thTdStyle}>{entry.document || "N/A"}</td>
                          <td style={thTdStyle}>{entry.name || "N/A"}</td>
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
              <h2 style={{ color: "#5cb85c" }}>
                {userIsAdmin ? "All Found Items" : "My Found Items"}
              </h2>
              {entries.filter((entry) => entry.type === "Found").length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                      <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .filter((entry) => entry.type === "Found")
                      .map((entry) => (
                        <tr key={entry.id || Math.random().toString()}>
                          <td style={thTdStyle}>{entry.document || "N/A"}</td>
                          <td style={thTdStyle}>{entry.name || "N/A"}</td>
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
            <h2 style={{ color: "#d9534f" }}>
              {userIsAdmin ? "All Lost Items" : "My Lost Items"}
            </h2>
            {entries.filter((entry) => entry.type === "Lost").length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((entry) => entry.type === "Lost")
                    .map((entry) => (
                      <tr key={entry.id || Math.random().toString()}>
                        <td style={thTdStyle}>{entry.document || "N/A"}</td>
                        <td style={thTdStyle}>{entry.name || "N/A"}</td>
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
            <h2 style={{ color: "#5cb85c" }}>
              {userIsAdmin ? "All Found Items" : "My Found Items"}
            </h2>
            {entries.filter((entry) => entry.type === "Found").length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                    <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((entry) => entry.type === "Found")
                    .map((entry) => (
                      <tr key={entry.id || Math.random().toString()}>
                        <td style={thTdStyle}>{entry.document || "N/A"}</td>
                        <td style={thTdStyle}>{entry.name || "N/A"}</td>
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
        return (
          <div className="matches-container">
            <h2 className="text-center mb-4">
              {userIsAdmin ? "System-Wide Match Analysis" : "AI-Based Matching System"}
            </h2>
            
            {/* Conditional UI based on user role */}
            {userIsAdmin ? (
              // ADMIN VIEW - Show all matches in one unified view
              <>
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
                    style={matchesSubTab === "myLost" ? activeSubtabStyle : subtabStyle}
                    onClick={() => setMatchesSubTab("myLost")}
                    className="me-3"
                  >
                    <i className="bi bi-search"></i> Matches for My Lost Items
                    <span className="badge bg-danger ms-2">{lostItemMatches.length}</span>
                  </div>
                  <div 
                    style={matchesSubTab === "myFound" ? activeSubtabStyle : subtabStyle}
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
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleContactPerson(match, 'finder')}
                              >
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
        );
      
      default:
        return <div>Invalid tab selected</div>;
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>
        {userIsAdmin ? "Lost & Found System" : "My Lost & Found Items"}
      </h1>

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
            {lostItemMatches.length + foundItemMatches.length}
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
                <p><strong>Document Type:</strong> {selectedEntry.document || "N/A"}</p>
                <p><strong>Name:</strong> {selectedEntry.name || "Not provided/visible"}</p>
                <p><strong>Location:</strong> {selectedEntry.location || "N/A"}</p>
                <p><strong>Date:</strong> {selectedEntry.type === "Lost" ? 
                  (selectedEntry.dateLost || "N/A") : 
                  (selectedEntry.dateFound || "N/A")}
                </p>
                <p><strong>Contact:</strong> {selectedEntry.contact || "N/A"}</p>
                <p><strong>Email:</strong> {selectedEntry.email || "N/A"}</p>
                {selectedEntry.type === "Lost" && selectedEntry.additionalDetails && (
                  <p><strong>Additional Details:</strong> {selectedEntry.additionalDetails}</p>
                )}
                {selectedEntry.type === "Found" && selectedEntry.description && (
                  <p><strong>Description:</strong> {selectedEntry.description}</p>
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