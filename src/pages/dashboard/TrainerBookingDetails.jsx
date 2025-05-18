import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentVerification from '../../components/PaymentVerification';
import PaymentVerificationButton from '../../components/PaymentVerificationButton';

const TrainerBookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/trainer-bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
      toast.error('Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red',
      refunded: 'blue',
    };
    return statusColors[status?.toLowerCase()] || 'gray';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 text-lg">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Trainer Booking Details</h1>
        <p className="text-gray-600">View detailed information about your booking</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Trainer</h3>
          <p className="text-gray-900 font-semibold">
            {booking.trainer?.name || 'Unknown Trainer'}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Session Date</h3>
          <p className="text-gray-900 font-semibold">
            {booking.sessionDate ? new Date(booking.sessionDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Duration</h3>
          <p className="text-gray-900 font-semibold">{booking.duration} hours</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Amount</h3>
          <p className="text-gray-900 font-semibold">₹{booking.amount?.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
          <div className="flex items-center mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
            <span className="ml-2 text-gray-500 text-sm">via {booking.paymentMethod}</span>
          </div>
          
          {/* Add the verification button */}
          <PaymentVerificationButton 
            booking={booking}
            onSuccess={(updatedBooking) => {
              setBooking({
                ...booking,
                paymentStatus: updatedBooking.paymentStatus || 'completed',
                status: updatedBooking.status || booking.status
              });
              fetchBooking(); // Refresh booking data
            }}
          />

          {/* Add payment verification component */}
          <PaymentVerification
            booking={booking}
            onVerificationComplete={(updatedBooking) => {
              // Update the booking data with the verified payment details
              setBooking({ ...booking, paymentStatus: updatedBooking.paymentStatus });
              // Refresh booking data
              fetchBooking();
            }}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="text-gray-900 font-semibold">
            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainerBookingDetails;