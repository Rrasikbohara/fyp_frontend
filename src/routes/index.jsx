import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PaymentConfirmation from '../pages/dashboard/PaymentConfirmation';
import Transactions from '../pages/dashboard/Transactions';
import EnhancedTransactions from '../pages/dashboard/EnhancedTransactions';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route path="transactions" element={<Transactions />} />
          <Route path="enhanced-transactions" element={<EnhancedTransactions />} />
          <Route path="payment-confirmation" element={<PaymentConfirmation />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;