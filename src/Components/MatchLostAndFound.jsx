import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

const MatchLostAndFound = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const entriesRef = ref(db, "entries");
    
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        
        // Separate lost and found items
        const lost = entriesArray.filter(item => item.type === "Lost");
        const found = entriesArray.filter(item => item.type === "Found");
        
        setLostItems(lost);
        setFoundItems(found);
      }
      setLoading(false);
    });
  }, []);

  // AI Matching Logic
  useEffect(() => {
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
              reasons: getMatchReasons(lostItem, foundItem, score)
            });
          }
        });
      });
  
      // Sort matches by score (highest first)
      matchedResults.sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore));
      setMatches(matchedResults);
    }
  }, [lostItems, foundItems]);

  // Generate human-readable match reasons
  const getMatchReasons = (lostItem, foundItem, score) => {
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

  // Card styles
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

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">AI-Based Lost & Found Matching</h2>
      <p className="text-center mb-4">Our system uses intelligent matching to help connect lost items with found reports.</p>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Analyzing lost and found items...</p>
        </div>
      ) : matches.length > 0 ? (
        <div>
          <p className="mb-4">We found {matches.length} potential matches based on our AI matching algorithm:</p>
          
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
      )}
    </div>
  );
};

export default MatchLostAndFound;