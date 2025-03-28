// src/Components/MatchLostAndFound.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { rtdb } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import ContactForm from "./ContactForm";

function MatchLostAndFound() {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotifications();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const matchesRef = ref(rtdb, "matches");
    
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        const matchesData = snapshot.val();
        const matchesArray = Object.keys(matchesData).map(key => ({
          id: key,
          ...matchesData[key]
        }));
        
        // Filter matches related to the current user
        const userMatches = matchesArray.filter(match => 
          (match.lostItem?.userId === currentUser.uid) || 
          (match.foundItem?.userId === currentUser.uid)
        );
        
        setMatches(userMatches);
      } else {
        setMatches([]);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
    setShowContactForm(false);
  };

  const handleContactInitiate = () => {
    setShowContactForm(true);
  };

  const handleMessageSent = (recipientId) => {
    // Close contact form
    setShowContactForm(false);
    
    // Send notification to the recipient
    sendNotification(
      recipientId,
      'message',
      'New Message Received',
      `You have a new message regarding a potential match for your item.`,
      {
        link: '/messages',
        matchId: selectedMatch.id
      }
    );
    
    // Update match status to "In Contact"
    if (selectedMatch) {
      const matchRef = ref(rtdb, `matches/${selectedMatch.id}`);
      update(matchRef, { 
        contactInitiated: true,
        lastContactDate: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Potential Matches</h2>
      
      {matches.length > 0 ? (
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Available Matches</h5>
              </div>
              <div className="list-group list-group-flush">
                {matches.map(match => (
                  <button
                    key={match.id}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedMatch?.id === match.id ? 'active' : ''}`}
                    onClick={() => handleSelectMatch(match)}
                  >
                    <div>
                      <div className="fw-bold">
                        {match.lostItemTitle || match.lostItem?.document || "Unknown"}
                        {" "}⟷{" "}
                        {match.foundItemTitle || match.foundItem?.document || "Unknown"}
                      </div>
                      <small className="d-block">
                        Match Score: {match.matchScore || match.score || "N/A"}%
                      </small>
                    </div>
                    {match.contactInitiated && (
                      <span className="badge bg-info">In Contact</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            {selectedMatch ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Match Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-danger text-white">
                          <h6 className="mb-0">Lost Item</h6>
                        </div>
                        <div className="card-body">
                          <p><strong>Document:</strong> {selectedMatch.lostItemTitle || selectedMatch.lostItem?.document || "N/A"}</p>
                          <p><strong>Name:</strong> {selectedMatch.lostItem?.name || "N/A"}</p>
                          <p><strong>Location:</strong> {selectedMatch.lostItem?.location || "N/A"}</p>
                          <p><strong>Date Lost:</strong> {selectedMatch.lostItem?.dateLost || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">Found Item</h6>
                        </div>
                        <div className="card-body">
                          <p><strong>Document:</strong> {selectedMatch.foundItemTitle || selectedMatch.foundItem?.document || "N/A"}</p>
                          <p><strong>Name:</strong> {selectedMatch.foundItem?.name || "N/A"}</p>
                          <p><strong>Location:</strong> {selectedMatch.foundItem?.location || "N/A"}</p>
                          <p><strong>Date Found:</strong> {selectedMatch.foundItem?.dateFound || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h6>Match Criteria</h6>
                    <div className="progress mb-3" style={{ height: '25px' }}>
                      <div
                        className={`progress-bar ${selectedMatch.matchScore > 70 ? 'bg-success' : selectedMatch.matchScore > 40 ? 'bg-warning' : 'bg-danger'}`}
                        role="progressbar"
                        style={{ width: `${selectedMatch.matchScore || selectedMatch.score || 0}%` }}
                        aria-valuenow={selectedMatch.matchScore || selectedMatch.score || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {selectedMatch.matchScore || selectedMatch.score || "N/A"}%
                      </div>
                    </div>
                    
                    <ul className="list-group mb-4">
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
                    
                    {showContactForm ? (
                      <ContactForm 
                        recipientId={selectedMatch.lostItem?.userId === currentUser.uid 
                          ? selectedMatch.foundItem?.userId 
                          : selectedMatch.lostItem?.userId}
                        itemId={selectedMatch.id}
                        itemType={selectedMatch.lostItem?.userId === currentUser.uid ? 'Lost' : 'Found'}
                        onMessageSent={() => handleMessageSent(
                          selectedMatch.lostItem?.userId === currentUser.uid 
                            ? selectedMatch.foundItem?.userId 
                            : selectedMatch.lostItem?.userId
                        )}
                      />
                    ) : (
                      <button 
                        className="btn btn-primary w-100"
                        onClick={handleContactInitiate}
                      >
                        Contact {selectedMatch.lostItem?.userId === currentUser.uid ? 'Finder' : 'Owner'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <p className="mb-0 text-muted">Select a match to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <p className="mb-0">No potential matches found for your items. Check back later or try searching manually.</p>
        </div>
      )}
    </div>
  );
}

export default MatchLostAndFound;