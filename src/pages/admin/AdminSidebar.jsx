import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineUser, HiOutlineSearch, HiOutlineLogout, HiOutlineMail } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminSidebar = ({ collapsed, onLinkClick }) => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call the logoutAdmin function from useAuth to clear tokens and state
    logoutAdmin();
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Navigate to sign-in page
    navigate('/admin/signin');
  };

  return (
    <aside className={`flex flex-col ${collapsed ? 'items-center' : 'px-4'} h-full`}>
      <NavLink to="/admin/dashboard" onClick={onLinkClick} className="w-full text-center text-2xl font-bold text-indigo-400 mb-4">
        {collapsed ? 'AP' : 'Admin Panel'}
      </NavLink>
      <nav className="space-y-2 flex-1 w-full overflow-y-auto pb-20">
        <NavLink to="/admin/dashboard" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineChartBar className="mx-auto w-5 h-5" /> : <>
            <HiOutlineChartBar className="mr-2 w-5 h-5" /> Dashboard
          </>}
        </NavLink>
        <NavLink to="/admin/gym-bookings" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineBookOpen className="mx-auto w-5 h-5" /> : <>
            <HiOutlineBookOpen className="mr-2 w-5 h-5" /> Gym Bookings
          </>}
        </NavLink>
        <NavLink to="/admin/trainer-bookings" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineUserGroup className="mx-auto w-5 h-5" /> : <>
            <HiOutlineUserGroup className="mr-2 w-5 h-5" /> Trainer Bookings
          </>}
        </NavLink>
       
        <NavLink to="/admin/users" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineUser className="mx-auto w-5 h-5" /> : <>
            <HiOutlineUser className="mr-2 w-5 h-5" /> Users
          </>}
        </NavLink>
       
        <NavLink to="/admin/trainers" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineSearch className="mx-auto w-5 h-5" /> : <>
            <HiOutlineSearch className="mr-2 w-5 h-5" /> Trainers
          </>}
        </NavLink>
        <NavLink to="/admin/feedback" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineOfficeBuilding className="mx-auto w-5 h-5" /> : <>
            <HiOutlineOfficeBuilding className="mr-2 w-5 h-5" /> Feedback
          </>}
        </NavLink>
        <NavLink to="/admin/contact" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          {collapsed ? <HiOutlineMail className="mx-auto w-5 h-5" /> : <>
            <HiOutlineMail className="mr-2 w-5 h-5" /> Contacts
          </>}
        </NavLink>
      </nav>
      <div className="mt-auto mb-4 w-full">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full p-4 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors justify-center"
        >
          {collapsed ? <HiOutlineLogout className="w-5 h-5" /> : <>
            <HiOutlineLogout className="mr-2 w-5 h-5" /> Logout
          </>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
