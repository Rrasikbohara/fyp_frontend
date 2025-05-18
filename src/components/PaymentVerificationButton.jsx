import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const PaymentVerificationButton = ({ booking, onSuccess }) => {
  const [verifying, setVerifying] = useState(false);

  // Only show for initiated Khalti payments
  if (!booking || booking.paymentStatus !== 'initiated' || booking.paymentMethod?.toLowerCase() !== 'khalti') {
    return null;
  }

  const verifyPayment = async () => {
    try {
      setVerifying(true);

      const response = await api.post('/payments/verify-khalti-payment', {
        token: booking.paymentDetails?.khaltiToken || 'manual-verification',
        purchaseOrderId: booking._id,
        bookingType: booking.sessionType ? 'trainer' : 'gym',
        amount: booking.amount || booking.totalPrice || 0,
        status: 'Completed'
      });

      if (response.data.success) {
        toast.success('Payment verified successfully!');
        if (onSuccess) {
          onSuccess(response.data.booking);
        }
      } else {
        toast.error(`Verification failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={verifyPayment}
        disabled={verifying}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          'Verify Payment'
        )}
      </button>
      <p className="mt-1 text-xs text-gray-500">
        Click to confirm your Khalti payment was successful
      </p>
    </div>
  );
};

export default PaymentVerificationButton;
