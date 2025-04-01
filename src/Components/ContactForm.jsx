// src/Components/ContactForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase';
import { ref, push } from 'firebase/database';
import { useNotifications } from './NotificationContext';

function ContactForm({ recipientId, itemId, itemType, onMessageSent, lostItem, foundItem, isAdmin }) {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotifications ? useNotifications() : { sendNotification: () => {} };
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Debugging logs to verify props
  console.log("ContactForm props:", { recipientId, itemId, itemType, lostItem, foundItem, isAdmin, currentUser });

  // Generate a default message based on whether the user is contacting the finder or owner
  useEffect(() => {
    let defaultMessage = '';
    
    if (itemType === 'Lost') {
      const itemName = lostItem?.document || 'item';
      defaultMessage = `Hello, I noticed you found an ${itemName} that might be mine. I would like to arrange verification and pickup if possible.`;
    } else {
      const itemName = foundItem?.document || 'item';
      defaultMessage = `Hello, I found a ${itemName} that may be yours. I'd be happy to arrange for you to verify and collect it.`;
    }
    
    setMessage(defaultMessage);
  }, [itemType, lostItem, foundItem]);

  // Handle form submission to send the message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    
    console.log("Form submitted");
    setError(null);
    setSending(true);
    
    try {
      // Reference to the messages path in Firebase
      const messagesRef = ref(rtdb, 'messages');
      
      // Create the message object
      const newMessage = {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: recipientId,
        recipientEmail: (itemType === 'Lost' ? foundItem?.email : lostItem?.email) || '',
        recipientName: (itemType === 'Lost' ? foundItem?.name : lostItem?.name) || '',
        itemId: itemId,
        itemType: itemType,
        message: message.trim(),
        read: false,
        timestamp: Date.now(), // Use client-side timestamp to avoid serverTimestamp issues
        lostItemDetails: lostItem,
        foundItemDetails: foundItem,
        status: 'unread'
      };
      
      console.log("Sending message:", newMessage);
      
      // Save the message to Firebase
      await push(messagesRef, newMessage);
      console.log("Message sent successfully");
      
      // Send a notification to the recipient if sendNotification is available
      if (typeof sendNotification === 'function') {
        console.log("Sending notification to recipient:", recipientId);
        sendNotification(
          recipientId,
          'message',
          'New Message Received',
          `You have a new message regarding a ${itemType} item.`,
          {
            link: '/messages',
            itemId
          }
        );
      } else {
        console.log("sendNotification is not a function");
      }
      
      // Clear the message input and reset the form
      setMessage('');
      setSending(false);
      
      // Call the onMessageSent callback to close the modal in MyReports.jsx
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
      setSending(false);
    }
  };

  return (
    <div className="contact-form">
      <h5 className="mb-3">
        Contact {itemType === 'Lost' ? 'Finder' : 'Owner'}
      </h5>
      
      {/* Display any errors */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Message form */}
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