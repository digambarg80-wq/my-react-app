function Services() {
  return (
    <div className="py-16 px-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <ServiceCard
          title="Living Room Design"
          img="https://images.unsplash.com/photo-1600210492493-0946911123ea"
        />
        <ServiceCard
          title="Bedroom Design"
          img="https://images.unsplash.com/photo-1615874959474-d609969a20ed"
        />
        <ServiceCard
          title="Modular Kitchen"
          img="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        />
      </div>
    </div>
  );
}

function ServiceCard({ title, img }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition duration-300">
      <img src={img} alt={title} className="h-64 w-full object-cover" />
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
    </div>
  );
}

export default Services;