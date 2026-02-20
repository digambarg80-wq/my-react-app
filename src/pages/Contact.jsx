import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, "contacts"), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      console.log('Contact saved with ID:', docRef.id);
      toast.success('Message sent successfully!');
      
      // Clear form
      setForm({ name: "", email: "", message: "" });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-6 max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows="5"
          required
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded transition disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export default Contact;