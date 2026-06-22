import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // চেক করবে ইউজার অলরেডি লগইন করা কিনা
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === "Teacher") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    }
  }, [navigate]);

  // গুগল লগইন সফল হলে এই ফাংশনটি চলবে
  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      
      // গুগল থেকে পাওয়া credential (idToken) সার্ভারে পাঠাচ্ছি
      const res = await axios.post(`${baseUrl}/auth/google`, {
        idToken: credentialResponse.credential, 
      });

      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Successfully logged in!');
        
        // লগইন সফল হলে রিডাইরেক্ট করবে
        setTimeout(() => {
          if (user.role === 'Teacher') {
            navigate('/admin', { replace: true });
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

  const handleError = () => {
    toast.error('Google sign-in failed. Please try again.');
  };

  return (
    <div className="h-auto my-60 w-full flex items-center justify-center">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="w-full max-w-sm mx-auto rounded-2xl bg-white p-6 border border-gray-200 shadow-xl shadow-cyan-500/5 backdrop-blur-sm">
        
        <h1 className="text-2xl font-extrabold text-center tracking-tight text-gray-800">
          Welcome Back
        </h1>

        <p className="text-center text-gray-400 mt-1 mb-6 text-sm font-medium">
          Sign in to access your Lab Tracker
        </p>

        {/* গুগল লগইন বাটন */}
        <div className="flex justify-center w-full">
          {isLoading ? (
            <div className="flex items-center gap-2 py-3 text-cyan-600 font-semibold">
               {/* এখানে চাইলে আপনি Spinner ব্যবহার করতে পারেন */}
               <span>Processing...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              size="large"
              shape="pill"
              theme="outline"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;