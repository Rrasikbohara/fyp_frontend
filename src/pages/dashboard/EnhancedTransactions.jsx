import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  HiOutlineRefresh, HiOutlineSearch, HiOutlineAdjustments, 
  HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineInformationCircle
} from 'react-icons/hi';

const EnhancedTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching user transactions...');
      
      // Try to get all transactions from the dedicated endpoint
      const response = await api.get('/user/transactions').catch(async (error) => {
        console.warn('Error with /user/transactions endpoint, trying fallback:', error);
        
        // If that fails, combine gym and trainer bookings manually
        const [gymResponse, trainerResponse] = await Promise.all([
          api.get('/bookings/user').catch(e => ({ data: [] })),
          api.get('/trainers/user-bookings').catch(e => ({ data: [] }))
        ]);
        
        // Process gym booking data
        const gymTransactions = (gymResponse.data || []).map((booking, index) => {
          // Ensure we get a numeric amount
          const amount = getBookingAmount(booking);
          
          return {
            id: index + 1,
            txnId: booking.paymentDetails?.transactionId || `GYM${booking._id.substr(-6)}`,
            _id: booking._id,
            user: booking.user?.name || 'Current User',
            userContact: booking.user?.phoneNumber || 'N/A',
            date: booking.bookingDate || booking.createdAt,
            formattedDate: formatDate(booking.bookingDate || booking.createdAt),
            product: booking.gym?.name || 'Gym Session',
            productId: booking._id,
            description: booking.gym ? `Booking at ${booking.gym.name}` : "Gym Booking",
            debit: 0,
            credit: amount,
            amount: amount,
            type: "Booking",
            paymentType: booking.paymentMethod || "Cash",
            bookingType: "gym",
            status: booking.paymentStatus || booking.status || 'pending',
            icon: "🏋️"
          };
        });
        
        // Process trainer booking data 
        const trainerTransactions = (trainerResponse.data || []).map((booking, index) => {
          // Get trainer name
          const trainerName = booking.trainerName || "Fitness Coach";
          
          // Ensure we get a numeric amount
          const amount = getBookingAmount(booking);
          
          return {
            id: gymTransactions.length + index + 1,
            txnId: booking.paymentDetails?.transactionId || `TR${booking._id.substr(-6)}`,
            _id: booking._id,
            user: booking.user?.name || 'Current User',
            userContact: booking.user?.phoneNumber || 'N/A',
            date: booking.bookingDate || booking.sessionDate || booking.createdAt,
            formattedDate: formatDate(booking.bookingDate || booking.sessionDate || booking.createdAt),
            product: `Training with ${trainerName}`,
            productId: booking._id,
            description: `Training session with ${trainerName}`,
            debit: 0,
            credit: amount,
            amount: amount,
            type: "Trainer Session",
            paymentType: booking.paymentMethod || "Cash",
            bookingType: "trainer",
            status: booking.paymentStatus || booking.status || 'pending',
            icon: "👟"
          };
        });
        
        // Add transaction fee entries for Khalti payments
        const feeTransactions = [...gymTransactions, ...trainerTransactions]
          .filter(txn => txn.paymentType.toLowerCase() === 'khalti')
          .map((txn, index) => {
            const feeAmount = Math.ceil(txn.amount * 0.03); // 3% fee
            return {
              id: gymTransactions.length + trainerTransactions.length + index + 1,
              txnId: `FEE-${txn.txnId}`,
              _id: `fee-${txn._id}`,
              user: 'Payment Gateway',
              userContact: 'service@khalti.com',
              date: txn.date,
              formattedDate: txn.formattedDate,
              product: 'Transaction Fee',
              productId: txn._id,
              description: `Fee for ${txn.description}`,
              debit: feeAmount,
              credit: 0,
              amount: feeAmount,
              type: "Fee",
              paymentType: "Automatic",
              bookingType: "fee",
              status: 'completed',
              icon: "💸"
            };
          });
        
        // Combine and sort all transactions
        const combinedTransactions = [...gymTransactions, ...trainerTransactions, ...feeTransactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return { data: combinedTransactions };
      });
      
      console.log('Transactions response:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history');
      toast.error('Could not load your transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}\n${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Helper function to get booking amount
  const getBookingAmount = (booking) => {
    let amount = 0;
    
    if (typeof booking.amount === 'number') {
      amount = booking.amount;
    } else if (typeof booking.amount === 'string') {
      amount = parseFloat(booking.amount) || 0;
    } else if (typeof booking.totalPrice === 'number') {
      amount = booking.totalPrice;
    } else if (typeof booking.totalPrice === 'string') {
      amount = parseFloat(booking.totalPrice) || 0;
    }
    
    // Default minimum amount
    return amount > 0 ? amount : 100;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (filter !== 'all' && transaction.bookingType !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.product?.toLowerCase().includes(query) ||
        transaction.txnId?.toLowerCase().includes(query) ||
        transaction.status?.toLowerCase().includes(query) ||
        transaction.paymentType?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Get status badge color
  const getStatusColor = (status) => {
    const statusMap = {
      'completed': 'green',
      'confirmed': 'green',
      'pending': 'yellow',
      'initiated': 'yellow',
      'failed': 'red',
      'cancelled': 'gray'
    };
    
    return statusMap[status.toLowerCase()] || 'yellow';
  };

  // Get transaction status badge
  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    
    const statusClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusClasses[color]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
          <p className="text-gray-600">View your payment history and booking transactions</p>
        </div>
        
        {/* View toggle */}
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Table View
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <HiOutlineAdjustments className="text-gray-500 mr-2" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="gym">Gym Sessions</option>
                <option value="trainer">Trainer Sessions</option>
                <option value="fee">Service Fees</option>
              </select>
            </div>
            
            <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <HiOutlineRefresh className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Transactions content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <HiOutlineCurrencyDollar className="h-16 w-16 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 text-lg">No transactions found</p>
            <p className="mt-2 text-gray-500">
              {searchQuery || filter !== 'all' ? 'Try adjusting your filters' : "You haven't made any bookings yet"}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          // TABLE VIEW
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Txn Id
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit(Rs.)
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit(Rs.)
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {transaction.txnId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {transaction.formattedDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.productId}<br/>
                      <span className="text-xs text-gray-500">{transaction.description}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.debit > 0 && `- ${transaction.debit}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.credit > 0 && `+ ${transaction.credit}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // CARD VIEW
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id || transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{transaction.icon}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{transaction.type}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {transaction.debit > 0 ? 
                        `₹-${transaction.debit.toFixed(2)}` : 
                        `₹${transaction.amount.toFixed(2)}`}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.paymentType}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p>{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p>{getStatusBadge(transaction.status)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="font-mono text-xs">{transaction.txnId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTransactions;
