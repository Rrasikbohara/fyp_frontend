import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { 
  HiRefresh, HiSearch, HiMail, HiUser, HiCheck, HiX, 
  HiClock, HiChevronDown, HiChevronUp, HiTrash, HiReply
} from 'react-icons/hi';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reply form
  const [replyContent, setReplyContent] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/contact/admin', {
        params: { status: statusFilter !== 'all' ? statusFilter : '', page }
      });
      
      console.log('Fetched contacts:', response.data);
      
      if (response.data.success) {
        setContacts(response.data.contacts || []);
        setTotalPages(response.data.pagination.pages || 1);
      } else {
        throw new Error(response.data.message || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts. Please try again.');
      toast.error('Error fetching contacts');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContacts();
  }, [statusFilter, page]);
  
  const handleStatusChange = async (id, status) => {
    try {
      setProcessingId(id);
      
      const response = await api.patch(`/contact/admin/${id}/status`, { status });
      
      if (response.data.success) {
        setContacts(contacts.map(contact => 
          contact._id === id ? { ...contact, status } : contact
        ));
        
        toast.success(`Contact status updated to ${status}`);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    try {
      setProcessingId(id);
      
      const response = await api.delete(`/contact/admin/${id}`);
      
      if (response.data.success) {
        setContacts(contacts.filter(contact => contact._id !== id));
        toast.success('Contact deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReply = async (id) => {
    if (!replyContent.trim()) {
      toast.warning('Please enter a reply message');
      return;
    }
    
    try {
      setProcessingId(id);
      
      const response = await api.post(`/contact/admin/${id}/reply`, {
        replyContent
      });
      
      if (response.data.success) {
        setContacts(contacts.map(contact => 
          contact._id === id ? { 
            ...contact, 
            status: 'replied',
            replyContent,
            repliedAt: new Date().toISOString()
          } : contact
        ));
        
        setReplyContent('');
        setExpandedId(null);
        toast.success('Reply sent successfully');
      } else {
        throw new Error(response.data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setProcessingId(null);
    }
  };
  
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setReplyContent('');
    } else {
      setExpandedId(id);
      // If there's already a reply, pre-populate the form
      const contact = contacts.find(c => c._id === id);
      if (contact && contact.replyContent) {
        setReplyContent(contact.replyContent);
      } else {
        setReplyContent('');
      }
    }
  };
  
  const filteredContacts = contacts.filter(contact => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      
      if (!fullName.includes(query) && 
          !contact.email.toLowerCase().includes(query) && 
          !contact.message.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    let icon = null;
    
    switch (status) {
      case 'replied':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <HiCheck />;
        break;
      case 'resolved':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <HiCheck />;
        break;
      case 'spam':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <HiX />;
        break;
      default:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <HiClock />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };
  
  if (loading && !contacts.length) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Contact Management</h1>
          <p className="text-gray-600">Manage and respond to user inquiries</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset pagination when filter changes
              }}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
              <option value="spam">Spam</option>
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
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No contact requests found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredContacts.map(contact => (
              <li key={contact._id} className="hover:bg-gray-50">
                <div 
                  onClick={() => toggleExpand(contact._id)} 
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <HiUser className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <HiMail className="mr-1" />
                            {contact.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      <StatusBadge status={contact.status} />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(contact.createdAt)}
                      </p>
                      <button 
                        className="mt-2 text-blue-500 hover:text-blue-700" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(contact._id);
                        }}
                      >
                        {expandedId === contact._id ? (
                          <HiChevronUp className="h-5 w-5" />
                        ) : (
                          <HiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedId === contact._id && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                    <div className="py-3">
                      <h3 className="text-sm font-medium text-gray-900">Full Message</h3>
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                    
                    {contact.phone && (
                      <div className="py-3">
                        <h3 className="text-sm font-medium text-gray-900">Phone Number</h3>
                        <p className="mt-1 text-sm text-gray-700">
                          {contact.phone}
                        </p>
                      </div>
                    )}
                    
                    {contact.status === 'replied' && contact.replyContent && (
                      <div className="py-3">
                        <h3 className="text-sm font-medium text-gray-900">Your Reply</h3>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {contact.replyContent}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Sent on {formatDate(contact.repliedAt)}
                        </p>
                      </div>
                    )}
                    
                    <div className="py-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {contact.status === 'replied' ? 'Send another reply' : 'Reply to this message'}
                      </h3>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter your reply here..."
                      ></textarea>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => handleReply(contact._id)}
                          disabled={processingId === contact._id || !replyContent.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                          <HiReply className="mr-2" />
                          {processingId === contact._id ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="py-3 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(contact._id, 'pending')}
                          disabled={processingId === contact._id || contact.status === 'pending'}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange(contact._id, 'resolved')}
                          disabled={processingId === contact._id || contact.status === 'resolved'}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleStatusChange(contact._id, 'spam')}
                          disabled={processingId === contact._id || contact.status === 'spam'}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                        >
                          Mark as Spam
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={processingId === contact._id}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                        >
                          <HiTrash className="mr-1 inline" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {contact.adminNotes && (
                      <div className="py-3 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Admin Notes</h3>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {contact.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  page === i + 1
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminContact;
