// src/components/MessageThread.js
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, BookOpen } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const MessageThread = ({ conversation, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // FIX: Fetch the specific thread from backend to stay in the same box
  const loadThread = async () => {
    const token = localStorage.getItem('token');
    let courseId = conversation.course?._id || conversation.course;
    const userId = conversation.otherUser?._id;

    // Build URL: course parameter only if it exists and is not 'general'
    let url = `${API_BASE_URL}/messages?user=${userId}`;
    if (courseId && courseId !== 'general') {
      url += `&course=${courseId}`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Thread load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
  }, [conversation.id]); // Reload only if the conversation ID changes

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    const courseId = conversation.course?._id || conversation.course;

    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receiver: conversation.otherUser._id,
          course: courseId,
          content: newMessage
        })
      });

      const result = await res.json();
      if (result.success) {
        setMessages([...messages, result.data]);
        setNewMessage('');
        scrollToBottom();
        onMessageSent(); // Refreshes the sidebar list in background
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Failed to send message");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-500 text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <User className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-slate-900">{conversation.otherUser.name}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <BookOpen size={12} /> {conversation.course?.title || "Course Discussion"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === currentUser.id || msg.sender === currentUser.id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {msg.content}
                  <div className={`text-[9px] mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your reply..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()} 
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageThread;