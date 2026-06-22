import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode করে নিবেন

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');

  // ১. টোকেন না থাকলে সরাসরি লগইন পেজে ব্যাক পাঠাবে
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    // ২. টোকেন ডিকোড করে ইউজারের রোল বের করা (আপনার ব্যাকএন্ডে jwt.sign এ রোল দেওয়া থাকলে ভালো, অথবা লোকালস্টোরেজ থেকে নিতে পারেন)
    // যদি ব্যাকএন্ড টোকেনে রোল না থাকে, তবে লগইনের সময় রোলটি localStorage-এ সেভ করে এখানে চেক করতে পারেন।
    // এখানে আমরা ধরে নিচ্ছি রোলটি localStorage-এ রাখা আছে বা টোকেনে আছে। 
    const userRole = localStorage.getItem('userRole'); // 'Teacher' বা 'Student'

    // ৩. ইউজারের রোল যদি অনুমোদিত রোলের সাথে না মিলে, তবে লগইন পেজে ব্যাক পাঠাবে
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    // ৪. সব ঠিক থাকলে ভেতরের লেআউট/কম্পোনেন্ট রেন্ডার করবে
    return <Outlet />;
  } catch (error) {
    // টোকেন করাপ্টেড হলে ক্লিয়ার করে লগইনে পাঠাবে
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;