import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const Invoice = ({ order }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render if no order
  if (!order) return null;

  return (
    <div>
      {/* Hidden printable invoice */}
      <div ref={componentRef} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="border-b-2 border-amber-500 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-amber-600">MAULI HOME INTERIORS</h1>
              <p className="text-gray-600">INSPIRED INTERIORS FOR INSPIRED LIVING</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">TAX INVOICE</h2>
              <p className="text-gray-500">Invoice #: {order.id?.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Company & Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-2">Seller Details:</h3>
            <p>Mauli Home Interiors</p>
            <p>Jawahar Colony, Chhatrapati Sambhajinagar</p>
            <p>Maharashtra, India - 431001</p>
            <p>Email: digambarg80@gmail.com</p>
            <p>Phone: +91 9834000290</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Buyer Details:</h3>
            <p><span className="font-medium">Name:</span> {order.customerName || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {order.customerEmail || 'N/A'}</p>
            <p><span className="font-medium">Phone:</span> {order.customerPhone || 'N/A'}</p>
            <p><span className="font-medium">Shipping Address:</span> {order.shippingAddress || 'N/A'}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded">
          <div>
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="font-medium">{formatDate(order.orderDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-medium text-sm">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-amber-500 text-white">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.name || 'N/A'}</td>
                  <td className="p-3 capitalize">{item.category || 'N/A'}</td>
                  <td className="p-3 text-right">{item.quantity || 0}</td>
                  <td className="p-3 text-right">₹{item.price || 0}</td>
                  <td className="p-3 text-right">₹{(item.price || 0) * (item.quantity || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center">No items found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping:</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t-2 border-amber-500">
              <span>Total:</span>
              <span>₹{order.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Payment Status:</span>
              <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
              </span>
            </div>
            {order.paymentId && (
              <div className="text-xs text-gray-500 mt-2">
                Payment ID: {order.paymentId}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-sm text-gray-500">
          <p>This is a computer generated invoice - no signature required.</p>
          <p className="mt-1">Thank you for shopping with Mauli Home Interiors!</p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 mx-auto"
      >
        <span>🖨️</span>
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;