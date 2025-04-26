// src/Components/ItemDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { rtdb } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import ItemStatusManager from './ItemStatusManager';
import ContactForm from './ContactForm';

function ItemDetail() {
  const { itemId } = useParams();
  const { currentUser } = useAuth();
  const { sendNotification } = useNotifications();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Fetch item details
  useEffect(() => {
    if (!itemId) return;

    const itemRef = ref(rtdb, `entries/${itemId}`);
    const unsubscribe = onValue(itemRef, (snapshot) => {
      if (snapshot.exists()) {
        const itemData = snapshot.val();
        setItem({
          id: itemId,
          ...itemData
        });
      } else {
        setError("Item not found");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching item:", error);
      setError("Failed to load item details");
      setLoading(false);
    });

    return unsubscribe;
  }, [itemId]);

  // Fetch potential matches
  useEffect(() => {
    if (!item) return;

    setLoadingMatches(true);
    const matchesRef = ref(rtdb, "matches");
    
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        const matchesData = snapshot.val();
        const matchesArray = Object.keys(matchesData).map(key => ({
          id: key,
          ...matchesData[key]
        }));
        
        // Filter matches related to this item
        const itemMatches = matchesArray.filter(match => {
          if (item.type === 'Lost') {
            return match.lostItemId === item.id || match.lostItem?.id === item.id;
          } else {
            return match.foundItemId === item.id || match.foundItem?.id === item.id;
          }
        });
        
        setPotentialMatches(itemMatches);
      } else {
        setPotentialMatches([]);
      }
      setLoadingMatches(false);
    });
    
    return unsubscribe;
  }, [item]);

  const handleStatusChange = async (newStatus) => {
    // Send notifications to admins
    try {
      // Fetch admin users
      const usersRef = ref(rtdb, "users");
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        
        // Find admin users
        Object.keys(usersData).forEach(userId => {
          const user = usersData[userId];
          if (user.role === 'admin') {
            // Send notification to each admin
            sendNotification(
              userId,
              'status',
              'Item Status Updated',
              `Item ${item.document} has been marked as ${newStatus} by the ${item.type === 'Lost' ? 'owner' : 'finder'}.`,
              {
                itemId: item.id,
                newStatus
              }
            );
          }
        });
      }
      
      // If this was matched with another item, notify that item's owner
      if (potentialMatches.length > 0) {
        const match = potentialMatches[0]; // Take the first match
        const otherItemId = item.type === 'Lost' ? match.foundItemId : match.lostItemId;
        const otherItemRef = ref(rtdb, `entries/${otherItemId}`);
        const otherItemSnapshot = await get(otherItemRef);
        
        if (otherItemSnapshot.exists()) {
          const otherItem = otherItemSnapshot.val();
          if (otherItem.userId && otherItem.userId !== currentUser.uid) {
            sendNotification(
              otherItem.userId,
              'status',
              `${item.type} Item Status Updated`,
              `An item matched with yours has been marked as ${newStatus}.`,
              {
                itemId: otherItemId,
                matchId: match.id
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const handleContactInitiate = () => {
    setShowContactForm(true);
  };

  const handleMessageSent = (recipientId) => {
    setShowContactForm(false);
    
    // Send notification to the recipient
    sendNotification(
      recipientId,
      'message',
      'New Message Received',
      `You have received a message about ${item.document}.`,
      {
        link: '/messages',
        itemId: item.id
      }
    );
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <p className="mb-0">{error}</p>
          <Link to="/my-reports" className="btn btn-primary mt-3">Back to My Reports</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className={`card-header ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'} text-white`}>
              <h4 className="mb-0">{item.type} Item Details</h4>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Item Information</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Document Type</th>
                        <td>{item.document}</td>
                      </tr>
                      {item.name && (
                        <tr>
                          <th>Name</th>
                          <td>{item.name}</td>
                        </tr>
                      )}
                      <tr>
                        <th>Location</th>
                        <td>{item.location}</td>
                      </tr>
                      <tr>
                        <th>Date {item.type === 'Lost' ? 'Lost' : 'Found'}</th>
                        <td>{item.type === 'Lost' ? item.dateLost : item.dateFound}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>
                          <span className={`badge ${
                            item.status === 'Found' || item.status === 'Returned' ? 'bg-success' :
                            item.status === 'Closed' ? 'bg-secondary' : 'bg-warning'
                          }`}>
                            {item.status || 'Open'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5>Additional Details</h5>
                  <p>{item.description || 'No additional details provided.'}</p>
                  
                  {item.userId === currentUser.uid && (
                    <div className="mt-4">
                      <ItemStatusManager 
                        item={item}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {item.userId !== currentUser.uid && (
                <div className="mt-3">
                  {showContactForm ? (
                    <ContactForm 
                      recipientId={item.userId}
                      itemId={item.id}
                      itemType={item.type}
                      onMessageSent={() => handleMessageSent(item.userId)}
                    />
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleContactInitiate}
                    >
                      Contact {item.type === 'Lost' ? 'Owner' : 'Finder'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Potential Matches</h5>
            </div>
            <div className="card-body">
              {loadingMatches ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mb-0 mt-2">Loading matches...</p>
                </div>
              ) : potentialMatches.length > 0 ? (
                <div className="list-group">
                  {potentialMatches.map(match => (
                    <Link 
                      key={match.id} 
                      to={`/match-lost-found?matchId=${match.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="d-block fw-bold">
                            {item.type === 'Lost' 
                              ? (match.foundItemTitle || match.foundItem?.document || "Found Item") 
                              : (match.lostItemTitle || match.lostItem?.document || "Lost Item")
                            }
                          </span>
                          <small>Match Score: {match.matchScore || match.score || "N/A"}%</small>
                        </div>
                        <span className={`badge ${match.matchScore > 70 ? 'bg-success' : match.matchScore > 40 ? 'bg-warning' : 'bg-danger'}`}>
                          {match.matchScore || match.score || "N/A"}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted my-3">
                  No potential matches found for this item yet.
                </p>
              )}
              
              <div className="mt-3">
                <Link to="/search" className="btn btn-outline-primary w-100">
                  Search Manually
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/my-reports" className="btn btn-outline-secondary">
                  Back to My Reports
                </Link>
                {item.userId === currentUser.uid && item.type === 'Lost' && (
                  <Link to="/search" className="btn btn-outline-success">
                    Search for matches
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;