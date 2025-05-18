import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL ;

// Log API configuration when the module loads
console.log('API URL:', API_URL);
console.log('Environment Variables Loaded:', !!import.meta.env.VITE_API_URL);

// Create an axios instance with some default settings
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Keep token keys consistent
const USER_TOKEN_KEY = 'userToken';
const ADMIN_TOKEN_KEY = 'adminToken';

// Add OTP-related endpoints to the list of public endpoints
const authEndpoints = ['/user/signin', '/user/signup', '/user/verify-otp'];

// Add a request interceptor to include authentication token
api.interceptors.request.use(
  (config) => {
    console.log('[API] Request to:', config.url);
    
    // Special handling for feedback endpoints
    if (config.url.includes('/feedback') && config.method === 'post') {
      console.log('[API] Handling feedback request:', config.method, config.url);
      
      // Ensure data is properly formatted
      let reqData;
      if (typeof config.data === 'string') {
        try {
          reqData = JSON.parse(config.data);
        } catch (e) {
          console.error('[API] Error parsing request data:', e);
          reqData = {};
        }
      } else {
        reqData = config.data || {};
      }
      
      // Log the actual data being sent for debugging
      console.log('[API] Feedback request data:', {
        trainer: reqData.trainer,
        rating: reqData.rating,
        review: reqData.review ? `${reqData.review.substring(0, 20)}...` : 'missing'
      });
      
      // If trainer ID is missing or invalid, log a warning
      if (!reqData.trainer) {
        console.error('[API] Missing trainer ID in feedback request');
      } else {
        console.log('[API] Found trainer ID in request:', reqData.trainer);
        
        // Explicitly ensure trainer ID is a string
        if (typeof reqData.trainer !== 'string') {
          reqData.trainer = String(reqData.trainer);
          console.log('[API] Converted trainer ID to string:', reqData.trainer);
          
          // Update config.data to use our modified data
          if (typeof config.data === 'string') {
            config.data = JSON.stringify(reqData);
          } else {
            config.data = reqData;
          }
        }
      }
    }
    
    // Skip auth for public endpoints
    if (authEndpoints.some(endpoint => config.url.includes(endpoint))) {
      console.log('[API] Not using token for public endpoint:', config.url);
      return config;
    }
    
    // Special handling for feedback endpoints to fix trainer ID issues
    if (config.url.includes('/feedback')) {
      console.log('[API] Handling feedback request:', config.method, config.url);
      
      // For POST requests to /feedback, make sure trainer ID is valid
      if (config.method === 'post' && config.data) {
        const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        
        // Validate trainer ID before sending
        if (!data.trainer) {
          console.error('[API] Missing trainer ID in feedback request');
          // Don't throw error here, let server handle it for consistent error messages
        } else {
          console.log('[API] Feedback submission with trainer ID:', data.trainer);
        }
      }
      
      // Always use user token for feedback submissions
      const token = localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] User auth header set for feedback request');
      } else {
        console.error('[API] No user token available for feedback request');
      }
      
      return config;
    }
    
    // Improved admin operation detection
    const isAdminOperation = 
      // Admin routes
      config.url.includes('/admin') || 
      // Admin-specific endpoints
      config.url.includes('/bookings/admin') ||
      config.url.includes('/trainers/admin') ||
      // Feedback status updates are admin operations
      config.url.includes('/feedback/') && config.url.includes('/status') ||
      // Booking operations from admin panel - both gym and trainer
      ((config.url.includes('/bookings/') || config.url.includes('/trainers/bookings/')) && 
       (config.url.includes('/status') || config.url.includes('/payment')));
    
    // Use the correct token based on the operation
    let token;
    
    if (isAdminOperation) {
      // For admin operations, try all possible admin token keys
      token = localStorage.getItem(ADMIN_TOKEN_KEY) || 
              localStorage.getItem('adminToken');
      
      console.log('[API] Using admin token for admin operation:', !!token, 'Length:', token?.length);
    } else {
      // For user operations, try all possible user token keys
      token = localStorage.getItem(USER_TOKEN_KEY) || 
              localStorage.getItem('token');
      
      console.log('[API] Using user token for request:', !!token);
    }
    
    // Fallback mechanism if the specific token wasn't found
    if (!token) {
      console.log('[API] Primary token not found, trying fallback');
      token = isAdminOperation 
        ? (localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem('token'))
        : (localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem('adminToken'));
      
      console.log('[API] Using fallback token:', !!token);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Auth header set with token length:', token.length);
    } else {
      console.log('[API] WARNING: No token available for authenticated request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error.config);
    
    // Special handling for feedback errors
    if (error.config && error.config.url.includes('/feedback') && error.config.method === 'post') {
      console.error('Feedback submission error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message || error.message
      });
      
      // Show user-friendly message for feedback errors
      if (error.response?.data?.message?.includes('trainer')) {
        toast.error('Please select a valid trainer before submitting feedback');
      }
    }
    
    // Log detailed error for payment and status updates
    if (error.config && 
        (error.config.url.includes('/payment') || error.config.url.includes('/status'))) {
      console.error('Status/Payment update error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: JSON.parse(error.config?.data || '{}')
      });
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized errors (expired or invalid token)
      if (status === 401) {
        console.log('User authentication error - clearing user token');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
      
      // Handle 403 Forbidden errors for admin endpoints
      if (status === 403 && error.config.url.includes('/admin/')) {
        console.log('Admin authentication error - clearing admin token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
      
      console.log('API error:', error);
      
      // For both 401 and 403 on API endpoints, clear relevant tokens
      if ((status === 401 || status === 403) && error.config.url.includes('/api/')) {
        console.log('API 401/403 error - clearing auth tokens');
        
        // First check if it's an admin endpoint and clear admin token
        if (error.config.url.includes('/admin/')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        } else {
          // For user endpoints, clear user token
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
        
        // For booking endpoints that might use admin auth, check both
        if (error.config.url.includes('/bookings/')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to test database connection
export const testDatabaseConnection = async () => {
  try {
    const response = await api.get('/system-status');
    return response.data.dbStatus === 'connected';
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Helper function to get user data from API or localStorage
export const getUserData = async () => {
  try {
    // First try to get from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // If not in localStorage, try to get from API
    const response = await api.get('/user/profile');
    
    // Save to localStorage for future use
    if (response.data) {
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Helper function to get admin data
export const getAdminData = async () => {
  try {
    // First try to get from localStorage
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      return JSON.parse(adminData);
    }
    
    // If not in localStorage, try to get from API
    const response = await api.get('/admin/me');
    
    // Save to localStorage for future use
    if (response.data) {
      localStorage.setItem('adminData', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return null;
  }
};

// Helper function for feedback submission with validation
export const submitFeedback = async (feedback) => {
  console.log('[API] submitFeedback called with:', { 
    trainer: feedback.trainer, 
    rating: feedback.rating, 
    reviewLength: feedback.review?.length 
  });
  
  if (!feedback.trainer) {
    console.error('[API] submitFeedback: Missing trainer ID');
    throw new Error('Trainer ID is required');
  }
  
  if (!feedback.rating || feedback.rating < 1) {
    throw new Error('Rating is required (1-5)');
  }
  
  if (!feedback.review || feedback.review.trim().length < 3) {
    throw new Error('Review is required (minimum 3 characters)');
  }
  
  try {
    // Ensure data is properly formatted
    const validatedData = {
      trainer: String(feedback.trainer),
      rating: Number(feedback.rating),
      review: feedback.review.trim()
    };
    
    console.log('[API] Submitting feedback with validated data:', validatedData);
    
    return await api.post('/feedback', validatedData);
  } catch (error) {
    console.error('[API] submitFeedback error:', error);
    throw error;
  }
};

export default api;