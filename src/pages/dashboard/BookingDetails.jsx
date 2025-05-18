import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import PaymentVerification from '../../components/PaymentVerification';
import PaymentVerificationButton from '../../components/PaymentVerificationButton';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

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
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Booking not found</p>
      </div>
    );
  }

  const paymentStatusColor = {
    completed: 'green',
    pending: 'yellow',
    failed: 'red',
    cancelled: 'gray',
  }[booking.paymentStatus?.toLowerCase()] || 'yellow';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
        <p className="text-gray-600">View detailed information about your booking</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
          <p className="text-gray-900 font-semibold">{booking._id}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="text-gray-900 font-semibold">{booking.description || 'No description available'}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="text-gray-900 font-semibold">
            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Amount</h3>
          <p className="text-gray-900 font-semibold">₹{booking.amount?.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
          <p className="text-gray-900 font-semibold">{booking.paymentMethod || 'Cash'}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
          <p className={`text-${paymentStatusColor}-600 font-semibold`}>
            {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'Pending'}
            {booking.paymentMethod && ` via ${booking.paymentMethod}`}
          </p>

          {/* Add payment verification component */}
          <PaymentVerification
            booking={booking}
            onVerificationComplete={(updatedBooking) => {
              // Update the booking data with the verified payment details
              setBooking({ ...booking, paymentStatus: updatedBooking.paymentStatus });
              // Refresh booking data
              fetchBookingDetails();
            }}
          />

          {/* Add the verification button */}
          <PaymentVerificationButton 
            booking={booking} 
            onSuccess={(updatedBooking) => {
              setBooking({
                ...booking, 
                paymentStatus: updatedBooking.paymentStatus,
                status: updatedBooking.status
              });
              toast.success('Payment status updated');
            }}
          />
        </div>

        <div className="p-4 bg-white rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Amount:</div>
            <div>₹{booking.payment?.amount || 0}</div>
            
            <div className="text-gray-600">Payment Method:</div>
            <div>{booking.payment?.method || "Cash"}</div>
            
            <div className="text-gray-600">Status:</div>
            <div>
              <StatusBadge status={booking.payment?.status || 'pending'} />
            </div>
          </div>
          
          {/* Add the verification button here */}
          <PaymentVerificationButton 
            booking={{
              ...booking,
              _id: booking._id,
              paymentStatus: booking.payment?.status,
              paymentMethod: booking.payment?.method,
              amount: booking.payment?.amount
            }} 
            onSuccess={(updatedBooking) => {
              setBooking({
                ...booking,
                payment: {
                  ...booking.payment,
                  status: updatedBooking.paymentStatus || 'completed'
                },
                status: updatedBooking.status || booking.status
              });
              fetchBookingDetails(); // Refresh booking data
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;