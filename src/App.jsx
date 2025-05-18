import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LazyLoader from "./utils/LazyLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer, toast } from 'react-toastify';
import api from './services/api.js'; // Assuming you have an api instance
import PaymentConfirmation from "./pages/dashboard/PaymentConfirmation"; // Add this import at the top

// For cleaner error handling
const withErrorBoundary = (Component) => (props) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);

const Home = lazy(() => import("./pages/Home/Home"));
const SignIn = lazy(() => import("./pages/auth/sign-in"));
const SignUp = lazy(() => import("./pages/auth/sign-up"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const Schedule = lazy(() => import("./pages/dashboard/Schedule"));
const PaymentIntegration =lazy(()=>import("./pages/dashboard/PaymentIntegration"))
const BookGym = lazy(() => import("./pages/dashboard/BookGym"));
const BookTrainer = lazy(() => import("./pages/dashboard/BookTrainer"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Transactions = lazy(() => import("./pages/dashboard/EnhancedTransactions"));
const Nutritions = lazy(() => import("./pages/dashboard/Nutritions"));
const Exercices = lazy(() => import("./pages/dashboard/Exercices"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBooking = lazy(() => import("./pages/admin/AdminBooking"));
const AdminPanelLayout = lazy(() => import("./pages/admin/AdminPanelLayout"));
const AdminTrainerBookings = lazy(() => import("./pages/admin/AdminTrainerBookings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTrainers = lazy(() => import("./pages/admin/AdminTrainers"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminAddTrainer = lazy(() => import("./pages/admin/AdminAddTrainer"));
const AdminContact = lazy(() => import("./pages/admin/AdminContact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const navigate = useNavigate();

  // Add a logout handler that redirects to home
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user'); // Remove legacy key
    
    // Remove auth header from axios
    if (api.defaults.headers.common['Authorization']) {
      delete api.defaults.headers.common['Authorization'];
    }
    
    // Navigate to home page
    navigate('/');
    
    // Optional: Show success message
    toast.success('Successfully logged out');
  };

  return (
    <>
      <ToastContainer />
      <Suspense fallback={<LazyLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Authentication routes */}
          <Route path="auth/sign-in" element={<SignIn />} />
          <Route path="auth/sign-up" element={<SignUp />} />
          <Route path="auth/forgot-password" element={<ForgotPassword />} />
          <Route path="auth/reset-password/:token" element={<ResetPassword />} />
          
          {/* Dashboard routes with layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="book-gym" element={<BookGym />} />
            <Route path="book-trainer" element={<BookTrainer />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="nutritions" element={<Nutritions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payment" element={<PaymentIntegration />} />
            <Route path="exercices" element={<Exercices />} />
            <Route path="payment-confirmation" element={<PaymentConfirmation />} /> {/* Added PaymentConfirmation route */}
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/signin" element={<AdminLogin />} />
          
          {/* FIXED: Removed duplicate admin route and properly nested the child routes */}
          <Route path="/admin" element={<AdminPanelLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="gym-bookings" element={<AdminBooking />} />
            <Route path="trainer-bookings" element={<AdminTrainerBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="trainers" element={<AdminTrainers />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="add-trainer" element={<AdminAddTrainer />} />
            <Route path="contact" element={<AdminContact />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;