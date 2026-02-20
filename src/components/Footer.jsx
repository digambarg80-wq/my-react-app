//src/components/Footer.jsx
import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="bg-neutral-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        {/* About Company */}
        <div>
          <h2 className="text-2xl font-bold text-amber-500 mb-4">
            Mauli Interior
          </h2>
          <p className="text-sm leading-6">
            We specialize in modern and luxury interior design solutions
            for homes and offices. Our mission is to transform your
            dream space into reality with elegance and perfection.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-amber-400">Home</Link></li>
            <li><Link to="/services" className="hover:text-amber-400">Services</Link></li>
            <li><Link to="/products" className="hover:text-amber-400">Products</Link></li>
            <li><Link to="/about" className="hover:text-amber-400">About</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Contact Us
          </h3>
          <p>📞 +91 9834000290</p>
          <p>✉ digambarg80@gmail.com</p>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Our Address
          </h3>
          <p>
            Mauli Interior Design Studio <br />
            Jawahar Colony, Chhatrapati Sambhaji Nagar <br />
            Maharashtra, India - 431001
          </p>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © 2026 Mauli Interior. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;
