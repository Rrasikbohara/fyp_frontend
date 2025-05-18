import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const PaymentVerification = ({ booking, onVerificationComplete }) => {
  const [verifying, setVerifying] = useState(false);

  const isKhaltiPending = booking && 
    booking.paymentMethod?.toLowerCase() === 'khalti' && 
    (booking.paymentStatus === 'pending' || booking.paymentStatus === 'initiated');

  if (!isKhaltiPending) {
    return null;
  }

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      
      const response = await api.post('/payments/verify-khalti', {
        bookingId: booking._id,
        token: booking.paymentToken || 'manual-verification',
        amount: booking.amount || booking.totalPrice || 0,
        bookingType: booking.type || (booking.trainer ? 'trainer' : 'gym')
      });

      if (response.data.success) {
        toast.success('Payment verification successful!');
        if (onVerificationComplete) {
          onVerificationComplete(response.data.booking);
        }
      } else {
        toast.error(`Verification failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={verifyPayment}
        disabled={verifying}
        className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
      >
        {verifying ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </>
        ) : (
          'Verify Khalti Payment'
        )}
      </button>
    </div>
  );
};

export default PaymentVerification;
