import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiCheckCircle, HiCurrencyDollar, HiCalendar, HiUserCircle, HiClock } from 'react-icons/hi';

const PaymentIntegration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [error, setError] = useState(null);
  const [successfulPayment, setSuccessfulPayment] = useState(false);
  
  // Extract and validate state data
  const { bookingData, trainer, bookingType } = location.state || {};
  
  useEffect(() => {
    // Validate the state data when component mounts
    if (!bookingData) {
      toast.error('Invalid booking information');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    setPaymentDetails({
      amount: getBookingAmount(),
      trainerName: trainer?.name,
      duration: bookingType === 'gym' ? bookingData.duration : bookingData.duration,
      sessionDate: bookingType === 'gym' 
        ? new Date(bookingData.bookingDate).toLocaleString() 
        : new Date(bookingData.sessionDate).toLocaleString(),
      bookingType: bookingType
    });

    // If cash payment, process the booking directly
    if ((bookingData.payment?.method === 'cash' || bookingData.paymentMethod === 'cash')) {
      handleCashPayment();
    }
    // If online payment (Khalti or credit card), auto-initiate payment process
    else if ((bookingData.payment?.method === 'khalti' || bookingData.paymentMethod === 'khalti' ||
              bookingData.payment?.method === 'credit_card' || bookingData.paymentMethod === 'credit_card') && 
              !processing) {
      // Use a small timeout to ensure UI is rendered before starting payment process
      const timer = setTimeout(() => {
        handleOnlinePayment();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [bookingData, trainer, navigate]);

  // Helper function to get booking amount
  const getBookingAmount = () => {
    if (bookingType === 'gym') {
      return bookingData.payment?.amount || 0;
    } else {
      return bookingData.amount || 0;
    }
  };
  
  // Helper function to get payment method
  const getPaymentMethod = () => {
    return bookingData.payment?.method || bookingData.paymentMethod || 'online';
  };

  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      let response;
      
      // Handle based on booking type
      if (bookingType === 'gym') {
        // Gym booking
        const paymentData = {
          ...bookingData,
          payment: {
            ...bookingData.payment,
            method: 'cash',
            status: 'pending'
          }
        };
        
        response = await api.post('/bookings/gym', paymentData);
      } else {
        // Trainer booking
        const paymentData = {
          ...bookingData,
          paymentMethod: 'cash',
          paymentStatus: 'pending'
        };
        
        response = await api.post(`/trainers/${trainer._id}/book`, paymentData);
      }
      
      toast.success('Booking successful! Please pay in cash at the gym.');
      setSuccessfulPayment(true);
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking');
      toast.error('Failed to create booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!bookingData) {
      toast.error('Missing booking information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let bookingId;
      let amount;

      // First step: Create a booking and get the ID
      if (bookingType === 'gym') {
        try {
          console.log('Creating gym booking with data:', {
            ...bookingData,
            payment: {
              ...bookingData.payment,
              method: 'khalti',
              // FIX: Always set to pending initially
              status: 'pending'
            }
          });
          
          // Create gym booking first to get ID
          const bookingResponse = await api.post('/bookings/gym', {
            ...bookingData,
            payment: {
              ...bookingData.payment,
              method: getPaymentMethod(),
              status: 'pending' // Always pending initially
            }
          });
          
          if (!bookingResponse.data.success) {
            throw new Error(bookingResponse.data.message || 'Failed to create booking');
          }
          
          bookingId = bookingResponse.data.booking._id;
          amount = bookingResponse.data.booking.payment.amount;
          console.log(`Gym booking created with id: ${bookingId}, amount: ${amount}`);
        } catch (error) {
          // Check for specific error types
          if (error.response?.status === 409) {
            // Handle conflict error (double booking)
            throw new Error(error.response.data.message || 'You already have a booking at this time');
          }
          throw error;
        }
      } else if (bookingType === 'trainer') {
        try {
          console.log('Creating trainer booking with data:', {
            ...bookingData,
            paymentMethod: 'khalti',
            // FIX: Always set to pending initially
            paymentStatus: 'pending'
          });
          
          // For trainers, we need a temporary booking that will be updated after payment
          const trainerBookingData = {
            ...bookingData,
            paymentMethod: getPaymentMethod(),
            paymentStatus: 'pending' // Always pending initially
          };
          
          const bookingResponse = await api.post(`/trainers/${trainer._id}/book`, trainerBookingData);
          
          bookingId = bookingResponse.data.booking._id;
          amount = bookingResponse.data.booking.amount;
          console.log(`Trainer booking created with id: ${bookingId}, amount: ${amount}`);
        } catch (error) {
          if (error.response?.status === 409) {
            // Handle conflict error (double booking)
            throw new Error(error.response.data.message || 'You already have a booking at this time');
          }
          throw error;
        }
      } else {
        throw new Error('Invalid booking type');
      }
      
      // Get current user info for Khalti
      const userResponse = await api.get('/user/profile');
      
      if (!bookingId) {
        throw new Error('Failed to create booking');
      }
      
      console.log(`Booking created with id: ${bookingId}, proceeding to payment`);
      
      // FIX: Add additional logging before payment initiation
      console.log('About to initiate payment with bookingId:', bookingId);
      
      // Now initialize Khalti payment
      const paymentData = {
        bookingId,
        bookingType,
        amount: amount || getBookingAmount(),
        customer_info: {
          name: userResponse.data.name,
          email: userResponse.data.email,
          phone: userResponse.data.phoneNumber || '1234567890'
        },
        return_url: `${window.location.origin}/dashboard/payment-confirmation`
      };
      
      console.log('Initiating payment with data:', paymentData);
      
      // Use the API route from Payment.js to initiate payment
      const response = await api.post('/payments/initiate-payment', paymentData);
      
      if (response.data.success && response.data.data.payment_url) {
        console.log('Payment initiation successful, redirecting to:', response.data.data.payment_url);
        // Redirect to Khalti payment page
        window.location.href = response.data.data.payment_url;
      } else {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle different types of errors with more specific messages
      let errorMessage = error.message || 'Payment failed';
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = error.response.data.message || 'You already have a booking at this time';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Invalid booking information';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to make this booking';
        } else if (error.response.status === 404) {
          errorMessage = 'Booking information not found';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  // If no booking data, show error
  if (!bookingData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-xl font-medium mb-4">Invalid booking information</h2>
        <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl overflow-hidden">
      <ToastContainer />
      
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <HiCurrencyDollar className="h-7 w-7" />
          {getPaymentMethod() === 'cash' ? 'Cash Payment' : 'Online Payment'}
        </h2>
        <p className="opacity-80">Complete your {bookingType === 'gym' ? 'gym session' : 'trainer session'} booking</p>
      </div>
      
      <div className="p-6">
        {successfulPayment ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              {getPaymentMethod() === 'cash' 
                ? 'Your booking has been confirmed. Please pay in cash at the gym.'
                : 'Your payment was successful and your booking has been confirmed.'}
            </p>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-800">Booking Details</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                {/* Booking Type */}
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 w-5 h-5 flex-shrink-0">
                    {bookingType === 'gym' ? '🏋️‍♂️' : '👨‍🏫'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Type</p>
                    <p className="font-semibold capitalize">{bookingType} Session</p>
                  </div>
                </div>
                
                {/* Trainer name if applicable */}
                {bookingType === 'trainer' && trainer && (
                  <div className="flex items-center gap-3">
                    <HiUserCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Trainer</p>
                      <p className="font-semibold">{trainer.name}</p>
                    </div>
                  </div>
                )}
                
                {/* Date */}
                <div className="flex items-center gap-3">
                  <HiCalendar className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Session Date</p>
                    <p className="font-semibold">
                      {bookingType === 'gym' 
                        ? new Date(bookingData.bookingDate).toLocaleDateString()
                        : new Date(bookingData.sessionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Time & Duration */}
                <div className="flex items-center gap-3">
                  <HiClock className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time & Duration</p>
                    <p className="font-semibold">
                      {bookingType === 'gym' 
                        ? `${bookingData.startTime} - ${bookingData.endTime} (${bookingData.duration} hour${bookingData.duration > 1 ? 's' : ''})`
                        : `${bookingData.startHour}:00 - ${bookingData.startHour + Number(bookingData.duration)}:00 (${bookingData.duration} hour${bookingData.duration > 1 ? 's' : ''})`}
                    </p>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="flex items-center gap-3">
                  <HiCurrencyDollar className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-bold text-lg">₹{getBookingAmount()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            {getPaymentMethod() === 'cash' ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Method</h4>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getPaymentMethod() === 'khalti' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <HiCurrencyDollar className={`w-5 h-5 ${
                        getPaymentMethod() === 'khalti' ? 'text-purple-700' : 'text-blue-700'
                      }`} />
                    </div>
                    <div className="font-medium">
                      {getPaymentMethod() === 'khalti' ? 'Khalti' : 'Credit Card'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleOnlinePayment}
                  disabled={processing}
                  className={`w-full ${
                    getPaymentMethod() === 'khalti' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white p-4 rounded-lg transition-colors flex items-center justify-center space-x-3 font-medium disabled:opacity-70`}
                >
                  {processing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8-8-3.59 8-8 8zm-1-13v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                      </svg>
                      <span>Pay Now - ₹{getBookingAmount()}</span>
                    </>
                  )}
                </button>
              </>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              disabled={processing}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel and Return
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
