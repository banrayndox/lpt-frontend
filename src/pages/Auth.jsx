import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Toast added

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

if (token && user) {
  if (user.role === "Teacher") {
    navigate("/admin", { replace: true });
  } else if (user.role === "Maintance") {
    navigate("/maintance", { replace: true });
  } else {
    navigate("/user", { replace: true });
  }
}
  }, [navigate]);
  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      const accessToken = tokenResponse.access_token;
      
      const res = await axios.post(`${baseUrl}/auth/google`, {
        idToken: accessToken,
      });

      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Successfully logged in!'); // English Toast
        
        setTimeout(() => {
             if (user.role === 'Teacher') {
            navigate('/admin', { replace: true });
            } else if (user.role === 'Maintance') {
            navigate('/maintance', { replace: true });
            } else {

  navigate('/user', { replace: true });
}
        }, 1000);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      toast.error(error.response?.data?.message || 'Login failed! Please check your server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error('Google Error:', error);
    toast.error('Google sign-in process failed.');
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
  });

// আগের কোড থেকে সামান্য পরিবর্তন:
return (
  <div className="h-auto my-60 w-full flex items-center justify-center ">
    <Toaster position="top-right" reverseOrder={false} />
    
    {/* বক্সের বাইরের মার্জিন বা স্পেসিং কন্ট্রোল করার জন্য এখানে দেখুন */}
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-white p-6 border border-gray-200 shadow-xl shadow-cyan-500/5 backdrop-blur-sm">
      
      <h1 className="text-2xl font-extrabold text-center tracking-tight text-gray-800">
        Welcome Back
      </h1>

      <p className="text-center text-gray-400 mt-1 mb-6 text-sm font-medium">
        Sign in to access your Lab Tracker
      </p>

      <button 
        onClick={() => !isLoading && login()}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-[#E0FEF9] px-4 py-3 text-gray-700 font-semibold transition-all duration-200 
          ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#ccfaf1] hover:border-cyan-200 active:scale-[0.98]'}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
        ) : (
          <FcGoogle size={20} />
        )}
        <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
      </button>
    </div>
  </div>
);
};

export default Auth;