import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to book appointment');
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Appointment booked successfully!');
    } catch (error) {
      toast.error('Error booking appointment');
    }
  };

  return (
    <div className="py-16 px-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Book Consultation</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Consultation Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="consultation">Home Consultation</option>
              <option value="video">Video Call</option>
              <option value="site">Site Visit</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="4"
              className="w-full p-2 border rounded"
              placeholder="Tell us about your project..."
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
}