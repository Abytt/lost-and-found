// src/Components/ContactForm.jsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

function ContactForm({ recipientId, itemId, itemType, onMessageSent }) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSending(true);
    
    try {
      const messagesRef = ref(rtdb, 'messages');
      await push(messagesRef, {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        recipientId,
        itemId,
        itemType,
        message,
        read: false,
        timestamp: serverTimestamp()
      });
      
      setMessage('');
      setSending(false);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setSending(false);
    }
  };

  return (
    <div className="contact-form">
      <h4>Contact Item {itemType === 'Lost' ? 'Finder' : 'Owner'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="message" className="form-label">Your Message</label>
          <textarea
            id="message"
            className="form-control"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Explain why you believe this is ${itemType === 'Lost' ? 'your lost item' : 'the owner of the item you found'}`}
            required
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;