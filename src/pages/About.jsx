function About() {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">About Us</h1>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
          alt="about"
          className="rounded-xl shadow-lg"
        />

        <p className="text-lg text-gray-600">
          Mauli Interior is a professional interior design company providing
          modern and luxury design solutions for homes and offices.
          We transform ideas into beautiful living spaces.
        </p>
      </div>
    </div>
  );
}

export default About;