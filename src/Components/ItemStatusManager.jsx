// src/Components/ItemStatusManager.jsx
import React, { useState } from 'react';
import { rtdb } from '../firebase';
import { ref, update } from 'firebase/database';

function ItemStatusManager({ item, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this item as ${newStatus}?`)) {
      return;
    }
    
    setUpdating(true);
    
    try {
      const itemRef = ref(rtdb, `entries/${item.id}`);
      await update(itemRef, { 
        status: newStatus,
        statusUpdatedAt: new Date().toISOString()
      });
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      alert(`Item successfully marked as ${newStatus}`);
    } catch (error) {
      console.error(`Error updating item status:`, error);
      alert('Failed to update item status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="item-status-manager">
      <h5>Update Item Status</h5>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {item.type === 'Lost' && item.status !== 'Found' && (
          <button
            className="btn btn-success"
            onClick={() => handleStatusChange('Found')}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'I Found My Item'}
          </button>
        )}
        
        {item.type === 'Found' && item.status !== 'Returned' && (
          <button
            className="btn btn-success"
            onClick={() => handleStatusChange('Returned')}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Returned to Owner'}
          </button>
        )}
        
        {item.status !== 'Closed' && (
          <button
            className="btn btn-secondary"
            onClick={() => handleStatusChange('Closed')}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Close This Case'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemStatusManager;