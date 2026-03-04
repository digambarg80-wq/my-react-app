import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ADD THIS IMPORT
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesQuery = query(
        collection(db, "services"),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(servicesQuery);
      const servicesList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(service => service.active !== false);
      
      // If no services in Firebase, use default data
      if (servicesList.length === 0) {
        setServices(defaultServices);
      } else {
        setServices(servicesList);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to default services on error
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  // Default services data with detailed descriptions
  const defaultServices = [
    {
      id: "1",
      title: "Living Room Design",
      description: "Transform your living space into a stunning centerpiece of your home. We create comfortable, stylish living rooms that reflect your personality and lifestyle.",
      image: "https://images.unsplash.com/photo-1600210492493-0946911123ea",
      features: ["Custom furniture selection", "Color consultation", "Lighting design", "Space planning"],
      materials: ["Premium fabrics", "Solid wood", "Marble finishes", "Designer lighting"],
      process: "2-3 weeks",
      price: "₹50,000 - ₹2,00,000",
      icon: "🛋️"
    },
    {
      id: "2",
      title: "Bedroom Design",
      description: "Create your personal sanctuary with our bedroom design services. We focus on comfort, relaxation, and storage solutions that maximize your space.",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
      features: ["Custom wardrobes", "Bed frame design", "Soft furnishings", "Ambient lighting"],
      materials: ["Solid wood", "Velvet", "Cotton", "Blackout curtains"],
      process: "2-4 weeks",
      price: "₹40,000 - ₹1,50,000",
      icon: "🛏️"
    },
    {
      id: "3",
      title: "Modular Kitchen",
      description: "Modern modular kitchens designed for functionality and style. We create efficient cooking spaces with smart storage solutions and premium finishes.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
      features: ["Modular cabinets", "Quartz countertops", "Backsplash design", "Appliance integration"],
      materials: ["Plywood", "Stainless steel", "Granite", "Soft-close mechanisms"],
      process: "3-5 weeks",
      price: "₹80,000 - ₹3,00,000",
      icon: "🍳"
    },
    {
      id: "4",
      title: "Home Office Design",
      description: "Productive and inspiring home office spaces designed for focus and comfort. We create ergonomic workspaces that boost your productivity.",
      image: "https://images.unsplash.com/photo-1596079890744-c1a0462d0975",
      features: ["Ergonomic furniture", "Cable management", "Task lighting", "Storage solutions"],
      materials: ["Solid wood desks", "Mesh chairs", "Glass", "Acoustic panels"],
      process: "2-3 weeks",
      price: "₹35,000 - ₹1,20,000",
      icon: "💼"
    },
    {
      id: "5",
      title: "Dining Room Design",
      description: "Elegant dining spaces perfect for family meals and entertaining guests. We design dining rooms that combine style with practicality.",
      image: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54",
      features: ["Dining table sets", "Sideboards", "Lighting fixtures", "Wall art"],
      materials: ["Solid wood", "Glass", "Marble", "Upholstered chairs"],
      process: "2-3 weeks",
      price: "₹45,000 - ₹1,80,000",
      icon: "🍽️"
    },
    {
      id: "6",
      title: "Bathroom Renovation",
      description: "Luxurious bathroom transformations that turn everyday routines into spa-like experiences. We focus on materials, fixtures, and efficient layouts.",
      image: "https://images.unsplash.com/photo-1620626011761-996317b8d101",
      features: ["Vanity design", "Shower enclosures", "Storage niches", "Lighting"],
      materials: ["Ceramic tiles", "Vitrified tiles", "Chrome fixtures", "Toughened glass"],
      process: "3-4 weeks",
      price: "₹60,000 - ₹2,50,000",
      icon: "🚿"
    }
  ];

  // Determine grid columns based on number of services
  const getGridClass = () => {
    if (services.length === 1) return "grid-cols-1 max-w-md mx-auto";
    if (services.length === 2) return "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
    if (services.length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (services.length >= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  if (loading) {
    return (
      <div className="py-20 px-6 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  // If a service is selected for detail view
  if (selectedService) {
    return (
      <div className="py-16 px-6 max-w-6xl mx-auto">
        <button
          onClick={() => setSelectedService(null)}
          className="mb-8 text-amber-500 hover:text-amber-600 flex items-center gap-2 font-medium"
        >
          ← Back to All Services
        </button>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-96">
            <img 
              src={selectedService.image} 
              alt={selectedService.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-amber-500 text-white text-4xl p-4 rounded-full shadow-lg">
              {selectedService.icon}
            </div>
          </div>
          
          <div className="p-8 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedService.title}</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{selectedService.description}</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-amber-50 p-5 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-amber-700">⏱️ Timeline</h3>
                <p className="text-gray-700">{selectedService.process}</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-amber-700">💰 Price Range</h3>
                <p className="text-gray-700">{selectedService.price}</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-amber-700">🎨 Style</h3>
                <p className="text-gray-700">Modern, Contemporary, Custom</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-amber-500">✨</span> What We Include
                </h2>
                <ul className="space-y-3">
                  {selectedService.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-amber-500 text-xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-amber-500">🔨</span> Materials We Use
                </h2>
                <ul className="space-y-3">
                  {selectedService.materials?.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-amber-500 text-xl">•</span>
                      <span className="text-gray-700">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <Link 
                to="/contact" 
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-medium transition transform hover:scale-105"
              >
                Book Free Consultation
              </Link>
              <Link 
                to="/products" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition"
              >
                View Related Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete interior design solutions tailored to your style and budget. 
            From concept to completion, we bring your vision to life.
          </p>
        </div>

        {/* Services Grid */}
        <div className={`grid ${getGridClass()} gap-8`}>
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white text-2xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  {service.icon}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-amber-500 transition">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Features Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features?.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      {feature}
                    </span>
                  ))}
                  {service.features?.length > 2 && (
                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-medium">
                      +{service.features.length - 2} more
                    </span>
                  )}
                </div>

                {/* Price and Timeline */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-lg font-bold text-amber-600">{service.price?.split(' - ')[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Timeline</p>
                    <p className="text-sm font-medium text-gray-700">{service.process}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <button className="w-full mt-4 bg-gray-100 hover:bg-amber-500 text-gray-700 hover:text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-white">
                  View Details
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">50+</p>
            <p className="text-gray-600">Projects Completed</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">100+</p>
            <p className="text-gray-600">Happy Clients</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">5+</p>
            <p className="text-gray-600">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-500">24/7</p>
            <p className="text-gray-600">Customer Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;