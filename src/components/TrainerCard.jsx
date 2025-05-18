import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiStar, HiClock, HiCurrencyDollar, HiAcademicCap, HiX, HiOutlineEye } from 'react-icons/hi';
import { motion } from 'framer-motion';

const TrainerCard = ({ trainer }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get trainer's initials for the avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Generate a background color based on trainer name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
      'bg-yellow-500', 'bg-teal-500'
    ];
    
    const nameHash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[nameHash % colors.length];
  };
  
  return (
    <>
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 flex flex-col items-center">
          {/* Circular Avatar with Initials */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ${getAvatarColor(trainer.name)}`}>
            {getInitials(trainer.name)}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-1">{trainer.name}</h3>
          
          <div className="text-sm text-gray-600 flex items-center gap-1 mb-3">
            <HiAcademicCap className="text-blue-600" />
            <span>{trainer.specialization}</span>
          </div>
          
          <div className="w-full border-t border-gray-100 my-3"></div>
          
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-1 text-blue-700 text-sm mb-1">
                <HiClock />
                <span>Experience</span>
              </div>
              <span className="font-semibold">{trainer.experience} years</span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-1 text-green-700 text-sm mb-1">
                <HiCurrencyDollar />
                <span>Hourly Rate</span>
              </div>
              <span className="font-semibold">₹{trainer.rate}</span>
            </div>
          </div>
          
          {trainer.rating > 0 && (
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(trainer.rating) ? "text-yellow-400" : "text-gray-300"}`} 
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">
                {trainer.rating.toFixed(1)}
              </span>
            </div>
          )}
          
          <div className="flex w-full gap-2">
            <button 
              onClick={() => setShowDetails(true)}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              <HiOutlineEye className="w-4 h-4" />
              View Details
            </button>
            
            <Link 
              to={`/dashboard/book-trainer?trainer=${trainer._id}`}
              className="flex-1 py-2 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Session
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Trainer Profile</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <HiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getAvatarColor(trainer.name)}`}>
                {getInitials(trainer.name)}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">{trainer.name}</h3>
                <p className="text-blue-600">{trainer.specialization}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Experience</p>
                <p className="font-semibold">{trainer.experience} years</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Rate</p>
                <p className="font-semibold">₹{trainer.rate}/hour</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(trainer.rating || 0) ? "text-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                  <span className="ml-1 text-sm">
                    {trainer.rating ? trainer.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Reviews</p>
                <p className="font-semibold">{trainer.reviews || 0}</p>
              </div>
            </div>
            
            {trainer.bio && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">About</h4>
                <p className="text-gray-600">{trainer.bio}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {trainer.specialization.split(',').map((specialty, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link 
                to={`/dashboard/book-trainer?trainer=${trainer._id}`}
                className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Session
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TrainerCard;
