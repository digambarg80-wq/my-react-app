import React from 'react';

const WhatsAppButton = ({ product = null }) => {
  const phoneNumber = "919834000290"; // Your WhatsApp number with country code
  
  const getMessage = () => {
    if (product) {
      return encodeURIComponent(
        `Hi! I'm interested in ${product.name} (₹${product.price}). Can you provide more details?`
      );
    }
    return encodeURIComponent(
      `Hi! I'm interested in your interior design services. Can you provide more details?`
    );
  };

  const handleClick = () => {
    const message = getMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Floating button for bottom right
  if (!product) {
    return (
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#25D366',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}
      >
        📱
      </button>
    );
  }

  // Button for product page
  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        backgroundColor: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px'
      }}
    >
      📱 Enquire on WhatsApp
    </button>
  );
};

export default WhatsAppButton;