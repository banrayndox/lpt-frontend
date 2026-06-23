import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  // .trim() ব্যবহার করুন যেন কোনো হিডেন স্পেস না থাকে
  const userRole = localStorage.getItem('userRole')?.trim(); 

  if (!token || !userRole) {
    return <Navigate to="/" replace />;
  }

  // এখানেও চেক করুন আপনার Array তে বানানটি ঠিক আছে কি না
  if (!allowedRoles.includes(userRole)) {
    console.error("Access Denied: Role mismatch!");
    return <Navigate to="/nothuman" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;