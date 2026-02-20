const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Get email config from environment variables
const gmailEmail = functions.config().gmail?.email;
const gmailPassword = functions.config().gmail?.password;

if (!gmailEmail || !gmailPassword) {
  console.error('Email configuration missing! Run: firebase functions:config:set gmail.email="..." gmail.password="..."');
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// This function runs automatically when a new order is created
exports.sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    try {
      const order = snap.data();
      const orderId = context.params.orderId;
      
      console.log('📦 New order received:', orderId);
      console.log('Customer email:', order.customerEmail);

      // Skip if no email (shouldn't happen, but just in case)
      if (!order.customerEmail) {
        console.log('No customer email found, skipping notification');
        return null;
      }

      // Create email content
      const mailOptions = {
        from: `"Mauli Interior" <${gmailEmail}>`,
        to: order.customerEmail,
        subject: `✨ Order Confirmation #${orderId.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h1 style="color: #F59E0B; text-align: center;">Thank You for Your Order!</h1>
            <p style="text-align: center;">Dear ${order.customerName},</p>
            <p style="text-align: center;">We've received your order and will process it soon.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">Order Details</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
              
              <h3 style="margin-top: 20px;">Items:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #F59E0B; color: white;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
                ${order.items.map(item => `
                  <tr style="border-bottom: 1px solid #eaeaea;">
                    <td style="padding: 10px;">${item.name}</td>
                    <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right;">₹${item.price * item.quantity}</td>
                  </tr>
                `).join('')}
                <tr style="font-weight: bold;">
                  <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                  <td style="padding: 10px; text-align: right; color: #F59E0B;">₹${order.totalAmount}</td>
                </tr>
              </table>
              
              <h3 style="margin-top: 20px;">Shipping Address:</h3>
              <p>${order.shippingAddress}</p>
              
              <h3>Payment Method:</h3>
              <p>${order.paymentMethod}</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Mauli Interior<br>
              Jawahar Colony, Chhatrapati Sambhaji Nagar<br>
              Maharashtra, India - 431001
            </p>
          </div>
        `
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', order.customerEmail);
      console.log('Message ID:', info.messageId);
      
      // Update the order to mark email as sent
      await snap.ref.update({
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailMessageId: info.messageId
      });
      
      return null;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      console.error('Error details:', error.message);
      
      // Update order with error status
      await snap.ref.update({
        emailError: error.message,
        emailErrorAt: new Date().toISOString()
      });
      
      return null;
    }
  });