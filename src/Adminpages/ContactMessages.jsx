// src/Adminpages/ContactMessages.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (userData?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
      return;
    }

    fetchMessages();
  }, [currentUser, userData]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching contacts...');
      const snapshot = await getDocs(collection(db, 'contacts'));
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Messages fetched:', messagesList);
      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, 'contacts', id));
      toast.success('Message deleted');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Message</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(msg => (
              <tr key={msg.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{msg.name || '-'}</td>
                <td className="px-6 py-4">{msg.email || '-'}</td>
                <td className="px-6 py-4 max-w-md truncate">{msg.message || '-'}</td>
                <td className="px-6 py-4">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {messages.length === 0 && (
          <p className="text-center py-8 text-gray-500">No messages yet</p>
        )}
      </div>
    </div>
  );
}