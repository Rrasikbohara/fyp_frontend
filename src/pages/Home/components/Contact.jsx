import React, { useState } from 'react';
import { Typography, Input, Textarea, Button, Spinner } from "@material-tailwind/react";
import { api } from '../../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      disable: window.innerWidth < 768
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await api.post('/contact', formData);
      
      if (response.data.success) {
        toast.success('Your message has been sent successfully!');
        setSubmitStatus('success');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-8 relative bg-gray-100">
      <ToastContainer position="bottom-right" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-gray-100/95 to-white/90 backdrop-blur-sm"></div>
      <div className="container mx-auto relative z-10">
        <Typography 
          variant="h2" 
          className="text-center mb-16 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c8e235] to-[#9eb82a] hover:scale-110 transition-transform duration-300"
          data-aos="fade-down"
        >
          Let's Connect
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          <div 
            data-aos="fade-right"
            data-aos-duration="600"
            className="backdrop-blur-md bg-white/80 p-8 rounded-2xl border border-gray-200 hover:border-[#c8e235] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#c8e235]/30 hover:scale-[1.02] hover:-translate-y-1"
          >
            <Typography variant="h5" className="mb-6 text-[#9eb82a] font-bold hover:text-[#c8e235] transition-colors duration-300">
              Get in Touch
            </Typography>
            <Typography className="mb-10 text-gray-700">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
            <div className="space-y-8">
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-map-marker-alt text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Location</Typography>
                  <Typography className="text-gray-600">Platinum gym,tokha road,Kathmandu</Typography>
                </div>
              </div>
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-phone text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Phone</Typography>
                  <Typography className="text-gray-600">+9779841242423</Typography>
                </div>
              </div>
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-envelope text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Email</Typography>
                  <Typography className="text-gray-600">info@gymmanagement.com</Typography>
                </div>
              </div>
            </div>
          </div>
          <form 
            onSubmit={handleSubmit}
            data-aos="fade-left"
            data-aos-duration="600"
            className="space-y-8 backdrop-blur-md bg-white/80 p-8 rounded-2xl border border-gray-200 hover:border-[#c8e235] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#c8e235]/30 hover:scale-[1.02] hover:-translate-y-1"
          >
            {submitStatus === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg transition-all duration-500 animate-fadeIn">
                <p className="text-green-700">
                  Your message has been sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg transition-all duration-500 animate-fadeIn">
                <p className="text-red-700">
                  There was a problem sending your message. Please try again.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <Input 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                label="First Name" 
                required 
                className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
                labelProps={{ className: "text-gray-700" }}
              />
              <Input 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                label="Last Name" 
                required
                className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
                labelProps={{ className: "text-gray-700" }}
              />
            </div>
            <Input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              label="Email" 
              required
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
            />
            <Input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              label="Phone"
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
            />
            <Textarea 
              label="Message" 
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
              rows={4}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#c8e235] to-[#9eb82a] text-white hover:shadow-lg hover:shadow-[#c8e235]/40 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 w-full disabled:opacity-70"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner color="white" className="h-4 w-4" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
