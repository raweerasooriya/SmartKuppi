// src/components/MessageThread.js
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, BookOpen } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const MessageThread = ({ conversation, onMessageSent, onThreadRead }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Use friend's Role-Based Styling
  const role = (conversation?.otherUser?.role || '').toLowerCase();
  const roleStyles = role === 'admin'
    ? { avatar: 'bg-rose-100 text-rose-600', bubble: 'bg-rose-600 text-white', button: 'bg-rose-600 hover:bg-rose-700', input: 'focus:ring-rose-500' }
    : role === 'student'
      ? { avatar: 'bg-emerald-100 text-emerald-600', bubble: 'bg-emerald-600 text-white', button: 'bg-emerald-600 hover:bg-emerald-700', input: 'focus:ring-emerald-500' }
      : { avatar: 'bg-indigo-100 text-indigo-600', bubble: 'bg-indigo-600 text-white', button: 'bg-indigo-600 hover:bg-indigo-700', input: 'focus:ring-indigo-500' };

  const loadThread = async () => {
    const token = localStorage.getItem('token');
    const courseId = conversation.course?._id || conversation.course;
    const userId = conversation.otherUser?._id;

    let url = `${API_BASE_URL}/messages?user=${userId}`;
    if (courseId && courseId !== 'general') url += `&course=${courseId}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
        // Mark as read logic
        const unreadIncoming = data.data.filter(m => !m.read && m.receiver === currentUser.id);
        if (unreadIncoming.length > 0) {
           await Promise.all(unreadIncoming.map(m => fetch(`${API_BASE_URL}/messages/${m._id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }})));
           if (onThreadRead) onThreadRead();
        }
        scrollToBottom();
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadThread(); }, [conversation.id]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receiver: conversation.otherUser._id,
          course: conversation.course?._id || conversation.course,
          content: newMessage
        })
      });
      const result = await res.json();
      if (result.success) {
        setMessages([...messages, result.data]);
        setNewMessage('');
        scrollToBottom();
        onMessageSent(); 
      }
    } catch (err) { alert("Failed to send"); }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"/></div>;

  return (
    <div className="flex flex-col h-[550px] bg-white">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${roleStyles.avatar}`}>
          {conversation.otherUser.name?.[0].toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-slate-900">{conversation.otherUser.name}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">{conversation.otherUser.role}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = (msg.sender._id || msg.sender) === currentUser.id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? roleStyles.bubble : 'bg-slate-100 text-slate-800'}`}>
                {msg.content}
                <div className="text-[9px] mt-1 opacity-70 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 ${roleStyles.input}`} />
        <button type="submit" className={`p-2 rounded-xl text-white transition-all ${roleStyles.button}`}><Send size={20} /></button>
      </form>
    </div>
  );
};

export default MessageThread;