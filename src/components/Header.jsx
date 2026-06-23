import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Activity, ChevronDown, User as UserIcon } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ১. গ্লোবাল স্টোর ছাড়া সরাসরি localStorage থেকে ডেটা রিড করা
  const token = localStorage.getItem("token");
  
  // ব্যাকএন্ডের পাঠানো ইউজার অবজেক্ট লোকালস্টোরেজে JSON স্ট্রিং হিসেবে রাখলে এভাবে রিড করবেন
  const savedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  // ২. সাইন আউট ফাংশন
  const handleSignOut = () => {
    localStorage.clear(); // সব টোকেন ও রোল ডিলিট করবে
    navigate("/", { replace: true }); // লগইন পেজে ব্যাক পাঠাবে
  };

  return (
    <header className="sticky top-0 z-50 bg-[#E0FEF9]/80 backdrop-blur-md border-b border-[#bbf7ed] shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        
        {/* Logo / Title Section */}
        <div className="flex items-center gap-3 cursor-pointer" >
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 shadow-inner">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-800 font-sans">
            PPS Lab Performance <span className="text-cyan-600">Tracker</span>
          </h1>
        </div>

        {/* User Actions Section */}
        {token && savedUser && (
          <div className="relative flex items-center gap-4">
            
            {/* User Profile Dropdown Button */}
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-cyan-500/5 active:scale-98 border border-transparent hover:border-cyan-500/10 transition-all duration-200"
            >
              {/* গুগল প্রোফাইল পিকচার অথবা ডিফল্ট আইকন */}
              {savedUser.avatar ? (
                <img 
                  src={savedUser.avatar} 
                  alt={savedUser.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/20"
                  referrerPolicy="no-referrer" // গুগলের ইমেজ ব্লক হওয়া আটকাবে
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  {savedUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* ইউজার নেম ও রোল (ডেস্কটপ ভিউ) */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-700 leading-none mb-0.5">{savedUser.name}</span>
                <span className="text-[11px] font-medium text-cyan-600 tracking-wider uppercase">{savedUser.role}</span>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* ব্যাকড্রপ ক্লিক করলে ড্রপডাউন বন্ধ হবে */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="absolute right-0 top-12 z-50 w-56 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-gray-50 text-left">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{savedUser.email}</p>
                  </div>

                  {/* সাইন আউট বাটন */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-[92%] mx-auto mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}

          </div>
        )}
        
      </div>
    </header>
  );
};

export default Header;