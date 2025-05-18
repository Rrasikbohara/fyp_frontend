import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import AdminSidebar from './AdminSidebar';

const AdminPanelLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-3 lg:hidden flex justify-between items-center sticky top-0 z-40">
        <button onClick={toggleMobileSidebar}>
          {mobileSidebarOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
        </button>
        <h1 className="text-base font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="flex flex-1">
        {/* Desktop Sidebar - Fixed position */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen z-30">
          <div className={`h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white border-r border-gray-700 flex flex-col`}>
            <div className="flex justify-end p-2">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <HiOutlineMenuAlt3 className="w-6 h-6" /> : <HiX className="w-6 h-6" />}
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <AdminSidebar collapsed={sidebarCollapsed} onLinkClick={() => {}} />
            </div>
          </div>
        </div>
        
        {/* Mobile Sidebar Overlay - Fixed position */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 lg:hidden">
            <div className="fixed top-0 left-0 w-64 bg-gray-900 text-white h-full overflow-y-auto">
              <div className="flex justify-end p-4">
                <button onClick={closeMobileSidebar}>
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <AdminSidebar collapsed={false} onLinkClick={closeMobileSidebar} />
            </div>
          </div>
        )}
        
        {/* Main Panel - Add left margin to account for fixed sidebar */}
        <div className={`flex-1 p-6 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} w-full transition-all duration-300`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanelLayout;
