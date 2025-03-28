// src/Components/Messages.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { Link } from 'react-router-dom';

function Messages() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = ref(rtdb, 'messages');
    
    // Listen for all messages where the current user is either the sender or recipient
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        
        // Filter messages relevant to the current user
        const userMessages = messagesArray.filter(msg => 
          msg.senderId === currentUser.uid || msg.recipientId === currentUser.uid
        );
        
        // Sort by timestamp, newest first
        userMessages.sort((a, b) => {
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        setMessages(userMessages);
        
        // Mark incoming messages as read
        userMessages.forEach(msg => {
          if (msg.recipientId === currentUser.uid && !msg.read) {
            update(ref(rtdb, `messages/${msg.id}`), { read: true });
          }
        });
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Group messages by conversation (combining to/from the same person about the same item)
  const conversations = messages.reduce((acc, message) => {
    // Create a unique key for the conversation
    const otherPersonId = message.senderId === currentUser.uid ? message.recipientId : message.senderId;
    const conversationKey = `${message.itemId}_${otherPersonId}`;
    
    if (!acc[conversationKey]) {
      acc[conversationKey] = {
        itemId: message.itemId,
        itemType: message.itemType,
        otherPersonId,
        otherPersonEmail: message.senderId === currentUser.uid ? message.recipientEmail : message.senderEmail,
        otherPersonName: message.senderId === currentUser.uid ? message.recipientName : message.senderName,
        messages: []
      };
    }
    
    acc[conversationKey].messages.push(message);
    return acc;
  }, {});

  const handleReadMessage = (messageId) => {
    if (!messageId) return;
    update(ref(rtdb, `messages/${messageId}`), { read: true });
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Messages</h2>
      
      <div className="row">
        {/* Conversations List */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Conversations</h5>
            </div>
            <div className="list-group list-group-flush">
              {Object.keys(conversations).length > 0 ? (
                Object.keys(conversations).map(key => {
                  const conversation = conversations[key];
                  const unreadCount = conversation.messages.filter(
                    msg => msg.recipientId === currentUser.uid && !msg.read
                  ).length;
                  
                  return (
                    <button
                      key={key}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeConversation === key ? 'active' : ''}`}
                      onClick={() => setActiveConversation(key)}
                    >
                      <div>
                        <div className="fw-bold">{conversation.otherPersonName || conversation.otherPersonEmail}</div>
                        <small>
                          {conversation.itemType} item: {conversation.itemId}
                        </small>
                      </div>
                      {unreadCount > 0 && (
                        <span className="badge bg-primary rounded-pill">{unreadCount}</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="list-group-item text-center text-muted">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Conversation */}
        <div className="col-md-8">
          {activeConversation ? (
            <div className="card">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {conversations[activeConversation].otherPersonName || conversations[activeConversation].otherPersonEmail}
                  </h5>
                  <small>
                    Item: {conversations[activeConversation].itemType} #{conversations[activeConversation].itemId.substring(0, 8)}
                  </small>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {conversations[activeConversation].messages.map(msg => {
                  const isFromMe = msg.senderId === currentUser.uid;
                  
                  // Mark message as read when viewing
                  if (!isFromMe && !msg.read) {
                    handleReadMessage(msg.id);
                  }
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`mb-3 ${isFromMe ? 'text-end' : 'text-start'}`}
                    >
                      <div 
                        className={`d-inline-block p-3 rounded-3 ${
                          isFromMe ? 'bg-primary text-white' : 'bg-light'
                        }`}
                        style={{ maxWidth: '75%' }}
                      >
                        {msg.message}
                        <div className="mt-1">
                          <small className={isFromMe ? 'text-white-50' : 'text-muted'}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Sending...'}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card-footer">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.replyMessage;
                  const message = input.value.trim();
                  
                  if (!message) return;
                  
                  const conversation = conversations[activeConversation];
                  const messagesRef = ref(rtdb, 'messages');
                  
                  push(messagesRef, {
                    senderId: currentUser.uid,
                    senderEmail: currentUser.email,
                    senderName: currentUser.displayName || currentUser.email,
                    recipientId: conversation.otherPersonId,
                    recipientEmail: conversation.otherPersonEmail,
                    recipientName: conversation.otherPersonName,
                    itemId: conversation.itemId,
                    itemType: conversation.itemType,
                    message,
                    read: false,
                    timestamp: serverTimestamp()
                  });
                  
                  input.value = '';
                }}>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      name="replyMessage"
                      placeholder="Type your message..." 
                      required 
                    />
                    <button className="btn btn-primary" type="submit">Send</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted">
                <p className="my-5">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;