import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Trash2, UserCog, UserCheck } from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';

const MaintenanceDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  // কনফিগ মেমোইজ করা হয়েছে যাতে ব্লিঙ্কিং না হয়
  const getConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  }), []);

// fetchUsers এর ভেতরে এই অংশটি আপডেট করুন
const fetchUsers = useCallback(async () => {
  try {
    setIsLoading(true);
    const res = await axios.get(`${baseUrl}/users`, getConfig());
    if (res.data?.success) {
      // এখানে শুধু Maintance ফিল্টার করবেন না, চাইলে রোল অনুযায়ী সর্টও করতে পারেন
      const sortedUsers = res.data.users.sort((a, b) => 
        (a.role === 'Maintance' ? -1 : 1)
      );
      setUsers(sortedUsers || []);
    }
  } catch (error) {
    console.error("Fetch Users Error:", error);
    toast.error("Failed to fetch users.");
  } finally {
    setIsLoading(false);
  }
}, [baseUrl, getConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, currentRole) => {
    // রোল টগল লজিক: Teacher থেকে Student অথবা উল্টোটা
    const newRole = currentRole === 'Teacher' ? 'Student' : 'Teacher';
    try {
      await axios.patch(`${baseUrl}/users/${userId}/role`, { role: newRole }, getConfig());
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update role.");
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) return;
    try {
      await axios.delete(`${baseUrl}/users/${userId}`, getConfig());
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("User removed successfully!");
    } catch (error) {
      toast.error("Failed to remove user.");
    }
  };

  const handleResetAll = async () => {
    const confirmed = window.confirm("WARNING: Are you sure you want to delete EVERYTHING? This cannot be undone.");
    if (!confirmed) return;
    
    try {
      setIsLoading(true);
      await axios.post(`${baseUrl}/reset-all`, {}, getConfig());
      setUsers([]);
      toast.success("System has been reset successfully.");
    } catch (error) {
      toast.error("Failed to reset system.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-teal-600" />
    </div>
  );

  return (
<div className="min-h-screen bg-[#F8FAFC] p-6">
  <div className="max-w-6xl mx-auto space-y-6">
    {/* Header */}
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Maintenance Dashboard</h2>
      <p className="text-sm text-gray-500">Manage platform users, roles, and access.</p>
    </div>

    {/* Table Section */}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-6">Email</th>
            <th className="py-4 px-6">Role</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-6 font-bold text-gray-800">{user.name}</td>
              <td className="py-4 px-6 text-gray-500">{user.email}</td>
              <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase 
                  ${user.role === 'Teacher' ? 'bg-purple-100 text-purple-700' : 
                    user.role === 'Maintance' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-4 px-6 text-right space-x-2">
                {/* 'Maintance' রোল হলে বাটন হাইড হবে */}
                {user.role !== 'Maintance' && (
                  <button 
                    onClick={() => handleRoleChange(user._id, user.role)}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                    title="Toggle Role"
                  >
                    {user.role === 'Teacher' ? <UserCheck className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
                  </button>
                )}
                <button 
                  onClick={() => handleRemoveUser(user._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Danger Zone */}
    <div className="bg-white p-6 rounded-2xl border border-red-200 mt-8 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
          <p className="text-xs text-gray-500">
            This will permanently remove all users and reset the system. This action cannot be undone.
          </p>
        </div>
        <button 
          onClick={handleResetAll}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          Reset Entire System
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default MaintenanceDashboard;