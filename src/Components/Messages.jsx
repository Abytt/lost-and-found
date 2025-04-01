// src/Components/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase';
import { ref, onValue, update, push } from 'firebase/database';
import { Link } from 'react-router-dom';

function Messages() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [requests, setRequests] = useState([]); // Track pending requests
  const [acceptedConversations, setAcceptedConversations] = useState(new Set()); // Track accepted conversations

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch messages from Firebase
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log(`Setting up messages listener for user: ${currentUser.email} (${currentUser.uid})`);
    const messagesRef = ref(rtdb, 'messages');

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      console.log("Messages data updated from Firebase");

      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.keys(messagesData).map((key) => ({
          id: key,
          ...messagesData[key],
        }));

        // Filter for messages where current user is sender or recipient
        const userMessages = messagesArray.filter((msg) => {
          const isSender = msg.senderId === currentUser.uid || msg.senderEmail === currentUser.email;
          const isRecipient = msg.recipientId === currentUser.uid || msg.recipientEmail === currentUser.email;
          return isSender || isRecipient;
        });

        console.log(`Found ${userMessages.length} messages for user`);
        setMessages(userMessages);

        // Mark messages as read if they're in the active conversation
        if (activeConversation) {
          const [activeItemId] = activeConversation.split('_');
          userMessages.forEach((msg) => {
            if (
              (msg.recipientId === currentUser.uid || msg.recipientEmail === currentUser.email) &&
              !msg.read &&
              msg.itemId === activeItemId
            ) {
              console.log(`Marking message ${msg.id} as read`);
              update(ref(rtdb, `messages/${msg.id}`), { read: true });
            }
          });
        }

        setLoading(false);
        if (activeConversation) {
          scrollToBottom();
        }
      } else {
        console.log("No messages found in database");
        setMessages([]);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error loading messages:", error);
      setLoading(false);
      setError("Failed to load messages. Please try again later.");
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Group messages into conversations
  const conversations = messages.reduce((acc, message) => {
    if (!message.itemId) return acc;

    // Create conversation ID using just itemId
    const conversationId = `${message.itemId}`;
    
    if (!acc[conversationId]) {
      // Initialize new conversation
      acc[conversationId] = {
        id: conversationId,
        itemId: message.itemId,
        itemType: message.itemType,
        itemName: message.itemName || 'Unknown Item',
        participants: new Set(),
        messages: [],
        // Store item details
        itemDetails: {
          type: message.itemType,
          name: message.itemName,
          location: message.itemLocation,
          date: message.itemType === 'Lost' ? message.dateLost : message.dateFound
        },
        status: message.status || 'accepted'
      };
    }

    // Add participants to the Set
    acc[conversationId].participants.add({
      id: message.senderId,
      name: message.senderName || message.senderEmail,
      role: message.itemType === 'Lost' ? 
        (message.senderId === message.itemOwnerId ? 'Owner' : 'Finder') : 
        (message.senderId === message.itemOwnerId ? 'Finder' : 'Owner')
    });

    // Add message to conversation
    acc[conversationId].messages.push({
      ...message,
      timestamp: message.timestamp || Date.now()
    });

    // Sort messages chronologically
    acc[conversationId].messages.sort((a, b) => a.timestamp - b.timestamp);

    return acc;
  }, {});

  // Log conversations for debugging
  useEffect(() => {
    console.log(conversations);
    console.log(`Grouped ${messages.length} messages into ${Object.keys(conversations).length} conversations`);
  }, [messages]);

  // Scroll to bottom when conversation changes or messages update
  useEffect(() => {
    if (activeConversation) {
      scrollToBottom();
    }
  }, [activeConversation, messages]);

  // Update conversations and requests when messages change
  useEffect(() => {
    if (!currentUser || !conversations) return;
    
    const newRequests = [];
    const newAcceptedConversations = new Set();

    Object.entries(conversations).forEach(([key, conversation]) => {
      // Find the other participant's ID
      const otherParticipant = Array.from(conversation.participants)
        .find(p => p.id !== currentUser.uid);
      
      if (otherParticipant) {
        conversation.otherPersonId = otherParticipant.id;
        conversation.otherPersonName = otherParticipant.name;
      }

      const isAccepted = conversation.status === 'accepted';
      if (isAccepted) {
        newAcceptedConversations.add(key);
      } else {
        newRequests.push(conversation);
      }
    });

    setRequests(newRequests);
    setAcceptedConversations(newAcceptedConversations);
  }, [currentUser?.uid, Object.keys(conversations).length]); // Only depend on conversation keys length

  // Accept a request
  const handleAcceptRequest = async (conversationId) => {
    try {
      const conversation = conversations[conversationId];
      const firstMessage = conversation.messages[0];
      
      // Update the first message status to accepted
      await update(ref(rtdb, `messages/${firstMessage.id}`), {
        status: 'accepted'
      });

      // Send automatic acceptance message
      const acceptMessage = {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: firstMessage.senderId,
        recipientEmail: firstMessage.senderEmail,
        itemId: firstMessage.itemId,
        itemType: firstMessage.itemType,
        itemName: firstMessage.itemName,
        message: "I have accepted your contact request. Let's discuss further.",
        timestamp: Date.now(),
        status: 'accepted',
        read: false
      };

      await push(ref(rtdb, 'messages'), acceptMessage);
      setAcceptedConversations(prev => new Set(prev).add(conversationId));
      setActiveConversation(conversationId);
    } catch (error) {
      console.error("Error accepting request:", error);
      setError("Failed to accept request. Please try again.");
    }
  };

  // Send a reply to the current conversation
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    setSending(true);
    setError(null);

    try {
      const conversation = conversations[activeConversation];
      if (!conversation) throw new Error('Conversation not found');

      // Get the first message of the conversation to find the original owner
      const firstMessage = conversation.messages[0];
      if (!firstMessage) throw new Error('No messages found in conversation');

      // Get participant info
      const participants = Array.from(conversation.participants);
      const otherParticipant = participants.find(p => p.id !== currentUser.uid);

      if (!otherParticipant?.id) {
        console.error('Recipient not found in participants:', participants);
        throw new Error('Recipient not found');
      }

      const newMessage = {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: otherParticipant.id,
        recipientEmail: otherParticipant.name,
        recipientName: otherParticipant.name,
        itemId: conversation.itemId,
        itemType: conversation.itemType,
        itemName: conversation.itemName,
        itemLocation: conversation.itemDetails?.location,
        itemOwnerId: firstMessage.senderId, // Use the sender of first message as item owner
        message: replyText.trim(),
        timestamp: Date.now(),
        status: 'accepted',
        read: false
      };

      console.log('Sending message:', newMessage);
      await push(ref(rtdb, 'messages'), newMessage);
      setReplyText('');
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-envelope-fill me-2 text-primary"></i>
          Messages
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Requests Section */}
      {requests.length > 0 && (
        <div className="mb-4">
          <h5>Requests</h5>
          <div className="list-group">
            {requests.map((request) => (
              <div key={request.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      {request.itemDetails.name}
                      <span className="badge bg-warning ms-2">Pending</span>
                    </h6>
                    <p className="mb-1 small text-muted">
                      From: {Array.from(request.participants)
                        .find(p => p.id !== currentUser.uid)?.name}
                    </p>
                    <p className="small text-muted">{request.messages[0]?.message}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {Object.keys(conversations).length === 0 ? (
        <div className="text-center p-5 bg-light rounded shadow-sm">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h4 className="mt-3 text-muted">No Messages Yet</h4>
          <p className="text-muted">
            When you contact someone about a lost or found item, your conversations will appear here. Check your{' '}
            <Link to="/my-reports" className="text-primary">reports</Link> to find matches and start a conversation!
          </p>
          <Link to="/search" className="btn btn-primary mt-3">
            Search Lost & Found Items
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Conversations List */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0">Conversations</h5>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {Object.entries(conversations)
                  .filter(([key]) => acceptedConversations.has(key))
                  .sort(([, a], [, b]) => {
                    const latestA = a.messages[a.messages.length - 1]?.timestamp || 0;
                    const latestB = b.messages[b.messages.length - 1]?.timestamp || 0;
                    return latestB - latestA;
                  })
                  .map(([key, conversation]) => {
                    const latestMessage = conversation.messages[conversation.messages.length - 1];
                    const unreadCount = conversation.messages.filter(
                      (msg) => !msg.read && msg.senderId !== currentUser.uid
                    ).length;
                    const otherParticipants = Array.from(conversation.participants)
                      .filter((p) => p.id !== currentUser.uid)
                      .map((p) => p.name)
                      .join(', ');

                    const timestamp = latestMessage
                      ? new Date(latestMessage.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '';

                    return (
                      <button
                        key={key}
                        className={`list-group-item list-group-item-action ${
                          activeConversation === key ? 'active' : ''
                        }`}
                        onClick={() => setActiveConversation(key)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">
                            {conversation.itemDetails.name || `${conversation.itemType} Item`}
                          </h6>
                          <small className="text-muted">{timestamp}</small>
                        </div>
                        <p className="mb-1 small text-muted">
                          Participants: {otherParticipants}
                        </p>
                        {latestMessage && (
                          <small className="text-truncate d-block">
                            {latestMessage.senderName}: {latestMessage.message}
                          </small>
                        )}
                        {unreadCount > 0 && (
                          <span className="badge bg-primary rounded-pill">{unreadCount}</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Active Conversation */}
          <div className="col-md-8">
            {activeConversation && acceptedConversations.has(activeConversation) ? (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      {conversations[activeConversation].otherPersonName}
                    </h5>
                    <span className="badge bg-light text-dark">
                      {conversations[activeConversation].itemType} Item
                    </span>
                  </div>
                </div>
                <div className="card-body bg-light" style={{ height: '400px', overflowY: 'auto' }}>
                  {conversations[activeConversation].messages.map((msg, index) => {
                    const isFromMe = msg.senderId === currentUser.uid || msg.senderEmail === currentUser.email;

                    const messageTime = msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Sending...';

                    return (
                      <div
                        key={msg.id || index}
                        className={`d-flex mb-3 ${isFromMe ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div
                          className={`d-inline-block p-3 rounded-3 ${
                            isFromMe ? 'bg-primary text-white' : 'bg-white'
                          } shadow-sm`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                          <div className="mt-1">
                            <small className={isFromMe ? 'text-white-50' : 'text-muted'}>
                              {messageTime}
                            </small>
                            {isFromMe && msg.read && (
                              <small className="text-white-50 ms-2">
                                <i className="bi bi-check2-all"></i> Seen
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="card-footer">
                  {error && (
                    <div className="alert alert-danger py-2 mb-2">{error}</div>
                  )}
                  <form onSubmit={handleSendReply}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message..."
                        required
                        disabled={sending}
                      />
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={sending}
                      >
                        {sending ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-send"></i>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-center text-center text-muted">
                  <div>
                    <i className="bi bi-chat-text" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <p className="mt-3">Select a conversation to view messages</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;