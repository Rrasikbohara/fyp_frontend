import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HiStar, HiOutlineStar, HiChevronLeft, HiChevronRight, HiUserCircle, 
  HiCheck, HiX, HiRefresh, HiOutlineTrash, HiSearch, HiFilter 
} from 'react-icons/hi';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { adminAuth } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check auth status when component mounts
  useEffect(() => {
    if (!adminAuth.loading && !adminAuth.isAuthenticated) {
      toast.error('Please sign in as admin to access this page');
      navigate('/admin/sign-in');
    }
  }, [adminAuth, navigate]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/feedback');
      
      console.log('Feedback data received:', response.data);
      
      if (response.data && response.data.feedback) {
        setFeedbacks(response.data.feedback || []);
      } else {
        console.error('Unexpected feedback data format:', response.data);
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback. Please try again.');
      toast.error('Error fetching feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuth.isAuthenticated) {
      fetchFeedbacks();
    }
  }, [adminAuth.isAuthenticated]);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (statusFilter !== 'all' && feedback.status !== statusFilter) {
      return false;
    }

    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      feedback.user?.name?.toLowerCase().includes(searchLower) ||
      feedback.trainer?.name?.toLowerCase().includes(searchLower) ||
      feedback.review?.toLowerCase().includes(searchLower)
    )) {
      return false;
    }

    return true;
  });

  // Calculate pagination indexes
  const indexOfLastFeedback = currentPage * itemsPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - itemsPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const handleStatusChange = async (id, status) => {
    try {
      setStatusUpdating(id);
      await api.patch(`/feedback/${id}/status`, { status });
      
      setFeedbacks(feedbacks.map(feedback => 
        feedback._id === id ? { ...feedback, status } : feedback
      ));
      
      toast.success(`Feedback status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update feedback status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      setStatusUpdating(id);
      await api.delete(`/feedback/${id}`);
      
      setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Pagination controls component
  const Pagination = () => {
    const pageNumbers = [];
    
    // Calculate which page numbers to show
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return (
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstFeedback + 1}-{Math.min(indexOfLastFeedback, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          
          {pageNumbers.map((number, idx) => (
            <button
              key={idx}
              onClick={() => typeof number === 'number' ? setCurrentPage(number) : null}
              className={`px-3 py-1 rounded-md ${
                currentPage === number 
                  ? 'bg-blue-600 text-white' 
                  : number === '...' 
                    ? '' 
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled={number === '...'}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
          
          <select 
            value={itemsPerPage} 
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="ml-4 p-2 border rounded-md"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Trainer Feedback Management</h1>
          <p className="text-gray-600">Review and manage feedback from users</p>
        </div>
        
        <button 
          onClick={fetchFeedbacks}
          className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          <HiRefresh className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback by user or trainer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center">
            <HiFilter className="text-gray-500 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {currentFeedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No feedback found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentFeedbacks.map(feedback => (
              <div key={feedback._id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <HiUserCircle className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">
                        {feedback.user?.name || 'Anonymous User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        To: <span className="font-medium">{feedback.trainer?.name || 'Unknown Trainer'}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <span key={star}>
                          {feedback.rating >= star ? 
                            <HiStar className="text-yellow-400" /> : 
                            <HiOutlineStar className="text-gray-300" />
                          }
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">{feedback.rating}/5</span>
                    
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      feedback.status === 'approved' ? 'bg-green-100 text-green-800' :
                      feedback.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feedback.status?.charAt(0)?.toUpperCase() + (feedback.status?.slice(1) || 'Pending')}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{feedback.review}</p>
                </div>
                
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {(!feedback.status || feedback.status !== 'approved') && (
                    <button
                      onClick={() => handleStatusChange(feedback._id, 'approved')}
                      disabled={statusUpdating === feedback._id}
                      className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <HiCheck className="mr-1" />
                      {statusUpdating === feedback._id ? 'Updating...' : 'Approve'}
                    </button>
                  )}
                  
                  {(!feedback.status || feedback.status !== 'rejected') && (
                    <button
                      onClick={() => handleStatusChange(feedback._id, 'rejected')}
                      disabled={statusUpdating === feedback._id}
                      className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <HiX className="mr-1" />
                      {statusUpdating === feedback._id ? 'Updating...' : 'Reject'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteFeedback(feedback._id)}
                    disabled={statusUpdating === feedback._id}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <HiOutlineTrash className="mr-1" />
                    {statusUpdating === feedback._id ? 'Processing...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredFeedbacks.length > 0 && <Pagination />}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminFeedback;
