import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HiHome, 
  HiCalendar, 
  HiUser , 
  HiCog,
  HiCurrencyDollar,
  HiBookOpen,
  HiUserGroup,
  HiOutlineLogout,
  HiBell
} from "react-icons/hi";
import { useAuth } from "../../../contexts/AuthContext";

const Sidebar = ({ scheduledWorkouts }) => {
  const { logout } = useAuth();
  
  // Check if there's a workout due soon (within the next hour)
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const upcomingWorkouts = scheduledWorkouts.filter(workout => {
    if (workout.day !== currentDay) return false;
    
    // Parse workout time
    const [hours, minutes] = workout.time.split(':').map(Number);
    
    // Check if workout is scheduled for the next hour
    const minutesDiff = (hours * 60 + minutes) - (currentHour * 60 + currentMinute);
    return minutesDiff > 0 && minutesDiff <= 60;
  });
  
  const hasUpcomingWorkout = upcomingWorkouts.length > 0;

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 lg:py-8 sm:py-16 flex flex-col">
      {/* Navigation Menu */}
      <nav className="p-2 space-y-1 flex-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiHome className="mr-3 w-5 h-5" /> 
          Home
        </NavLink>
        
        {/* Add notification indicator to the Schedule link */}
        <div className="relative">
          <NavLink 
            to="/dashboard/schedule" 
            className={({ isActive }) => `flex items-center p-3 rounded-lg ${
              isActive 
                ? 'bg-blue-100 text-blue-600 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiCalendar className="mr-3 w-5 h-5" /> 
            Workout Schedule
            
            {hasUpcomingWorkout && (
              <span className="flex absolute h-3 w-3 top-3 right-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </NavLink>
          
          {/* Workout notification tooltip */}
          {hasUpcomingWorkout && (
            <div className="absolute z-10 left-full ml-2 transform -translate-y-1/2 top-1/2 bg-white shadow-lg rounded-lg p-3 w-48 border border-gray-100">
              <div className="flex items-center text-blue-600 mb-2">
                <HiBell className="mr-2" />
                <span className="font-medium">Upcoming workout{upcomingWorkouts.length > 1 ? 's' : ''}</span>
              </div>
              {upcomingWorkouts.slice(0, 2).map((workout, idx) => (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  <div className="font-semibold">{workout.time} - {workout.exercise}</div>
                  <div>{workout.duration} minute{workout.duration !== 1 ? 's' : ''}</div>
                </div>
              ))}
              {upcomingWorkouts.length > 2 && (
                <div className="text-xs text-gray-500 mt-1">
                  +{upcomingWorkouts.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
        
        <NavLink 
          to="/dashboard/nutritions" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCalendar className="mr-3 w-5 h-5" /> 
          Nutritions
        </NavLink>
        
        <NavLink 
          to="/dashboard/transactions" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCurrencyDollar className="mr-3 w-5 h-5" /> 
          Transactions
        </NavLink>
        <NavLink 
          to="/dashboard/exercices" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCog className="mr-3 w-5 h-5" />
          Exercices
        </NavLink>
        <NavLink 
          to="/dashboard/book-gym" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiBookOpen className="mr-3 w-5 h-5" /> 
          Book Gym
        </NavLink>
        
        <NavLink 
          to="/dashboard/book-trainer" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiUserGroup className="mr-3 w-5 h-5" /> 
          Book Trainer
        </NavLink>
        <NavLink 
          to="/dashboard/profile" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiUser  className="mr-3 w-5 h-5" /> 
          Profile
        </NavLink>
      </nav>

      {/* Upcoming Workouts Section - Enhanced with notification styling */}
      <div className="mt-auto border-t p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
          <span>Upcoming Workouts</span>
          {hasUpcomingWorkout && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {upcomingWorkouts.length}
            </span>
          )}
        </h3>
        <div className="space-y-2">
          {scheduledWorkouts.slice(0, 3).map(workout => (
            <div 
              key={workout.id || workout._id} 
              className={`text-sm p-2 bg-white rounded-lg shadow-sm border ${
                upcomingWorkouts.some(w => (w.id || w._id) === (workout.id || workout._id))
                  ? 'border-red-300 bg-red-50 animate-pulse'
                  : 'border-gray-100'
              }`}
            >
              <div className="font-medium text-gray-700">{workout.day}</div>
              <div className="text-gray-500 truncate">{workout.exercise} ({workout.time})</div>
            </div>
          ))}
        </div>
       
      </div>

     
    </div>
  );
};

export default Sidebar;