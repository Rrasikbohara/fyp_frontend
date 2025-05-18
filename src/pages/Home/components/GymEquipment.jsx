import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const GymEquipments = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      delay: 100,
      once: true,
    });
  }, []);

  const [showMore, setShowMore] = useState(false);
  
  // Replace random images with actual gym equipment data
  const gymEquipments = [
    {
      id: 1,
      name: "Treadmill",
      description: "High-performance treadmill with incline options, heart rate monitoring, and preset workout programs.",
      image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Dumbbells Set",
      description: "Complete set of rubber-coated hex dumbbells ranging from 5 to 50 pounds for strength training.",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Smith Machine",
      description: "Versatile Smith machine for squats, bench presses, and various upper and lower body exercises.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Rowing Machine",
      description: "Digital rowing machine providing a full-body workout with adjustable resistance levels.",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      name: "Power Rack",
      description: "Heavy-duty power rack for safe and effective squats, pull-ups, and bench press exercises.",
      image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      name: "Elliptical Machine",
      description: "Low-impact cardio machine with adjustable incline and resistance for effective full-body workouts.",
      image: "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 7,
      name: "Cable Machine",
      description: "Dual adjustable pulley system allowing for a wide range of exercises targeting all major muscle groups.",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 8,
      name: "Exercise Bike",
      description: "Stationary bike with digital display and multiple resistance levels for effective cardio training.",
      image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  // Display only first 3 items or all based on showMore state
  const displayedEquipments = showMore ? gymEquipments : gymEquipments.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-hidden">
      <h1
        className="text-5xl font-bold text-center mb-8"
        data-aos="fade-down"
        data-aos-duration="1500"
      >
        Our Premium Equipment
      </h1>
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10" data-aos="fade-up">
        Train with state-of-the-art fitness equipment designed to maximize your workout efficiency 
        and help you achieve your fitness goals faster.
      </p>
      
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        data-aos="fade-up"
        data-aos-duration="1500"
      >
        {displayedEquipments.map((equipment) => (
          <div
            key={equipment.id}
            data-aos="flip-left"
            data-aos-duration="1000"
            className="bg-white shadow-2xl rounded-lg overflow-hidden transform hover:scale-105 transition duration-500 ease-in-out"
          >
            <img
              src={equipment.image}
              alt={equipment.name}
              className="w-full h-64 object-cover"
              data-aos="zoom-in"
              data-aos-duration="800"
            />
            <div className="p-6">
              <h2
                className="text-2xl font-bold text-blue-600 mb-2"
                data-aos="zoom-in"
                data-aos-duration="800"
              >
                {equipment.name}
              </h2>
              <p
                className="text-gray-700"
                data-aos="fade-right"
                data-aos-duration="800"
              >
                {equipment.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {gymEquipments.length > 3 && (
        <div className="mt-10 text-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={handleShowMore}
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            {showMore ? 'Show Less' : 'Show More Equipment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GymEquipments;