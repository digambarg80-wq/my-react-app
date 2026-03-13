import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path based on your structure
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! Welcome to Mauli Home Interior! How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  // REPLACE THIS with a new API Key from Google AI Studio
  const GEMINI_API_KEY = 'AIzaSyBQANXQEL0TPRZxFpHPFZTvHAipkQd0PwM';

  const shopInfo = {
    name: "Mauli Home Interior",
    address: "Your Shop Address Here",
    phone: "+91 94206 88356",
    email: " abhaywakle2171@gmail.com",
    workingHours: "Monday-Saturday: 9AM-9PM, Sunday: 10AM-6PM",
    delivery: "Free delivery on orders over ₹50,000",
    payment: "Cash, Credit Card, UPI, Bank Transfer",
    returnPolicy: "30-day return policy with original receipt"
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          if (!data.images && data.image) {
            data.images = [data.image];
          } else if (!data.images) {
            data.images = [];
          }
          return { id: doc.id, ...data };
        });
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInputText(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await getGeminiResponse(userMessage);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Final Chatbot Error:', error);
      
      let fallbackMessage = "I'm having trouble connecting to my brain right now. ";
      if (products.length > 0) {
        fallbackMessage += `But I can see we have ${products.length} items in stock! Please call us at ${shopInfo.phone} for immediate help.`;
      }
      setMessages(prev => [...prev, { text: fallbackMessage, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getGeminiResponse = async (userQuery) => {
    const productsData = products.map(p => ({
      name: p.name,
      price: p.price,
      category: p.category || 'Uncategorized',
      inStock: p.inStock !== undefined ? p.inStock : true
    }));

    const context = {
      shopInfo,
      products: productsData.slice(0, 50), // Send top 50 products to keep prompt size reasonable
      categories: [...new Set(productsData.map(p => p.category))]
    };

    const prompt = `
      You are a helpful assistant for "Mauli Home Interior".
      Context: ${JSON.stringify(context)}
      
      User Question: "${userQuery}"
      
      Instructions:
      1. Use the shop data above to answer.
      2. Mention prices in ₹.
      3. Be polite and professional.
      4. If you don't know, provide the shop's phone number: ${shopInfo.phone}.
    `;

    // The fix: Using 'v1beta' and 'gemini-1.5-flash'
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of modelNames) {
      try {
        console.log(`Attempting to reach ${model}...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();

        if (response.ok) {
          return data.candidates[0].content.parts[0].text;
        } else {
          console.warn(`${model} failed:`, data.error?.message || 'Unknown error');
          lastError = data.error;
        }
      } catch (err) {
        console.error(`Fetch error for ${model}:`, err);
        lastError = err;
      }
    }

    throw new Error(lastError?.message || "All models failed");
  };

  return (
    <div className="chatbot-container">
      <button className="chat-button" onClick={toggleChat}>
        {isOpen ? '✕' : '💬 Chat with us'}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Mauli Home Interior</h3>
            <p>Online Assistant</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <span className="typing-indicator">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Ask about products or prices..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;