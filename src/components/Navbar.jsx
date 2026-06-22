import React, { useState } from 'react';

const Navbar = () => {
  // Using state to manage the active tab, matching image_0.png
  const [activeTab, setActiveTab] = useState('Grades');

  // Define nav items with their display text and matching data value
  const navItems = [
    { name: 'Grades', text: 'Grades' },
    { name: 'Users', text: 'Users' },
    { name: 'Settings', text: 'Settings' }
  ];

  // Function to apply conditional styling to tabs
  const getTabClasses = (tabName) => {
    // Shared styling for all tabs
    const sharedClasses = "px-5 py-2.5 rounded-full font-medium text-sm transition-all";
    
    if (activeTab === tabName) {
      // Styling for active tab, matching "Grades" in image_0.png (white bg, teal text, shadow)
      return `${sharedClasses} bg-white text-teal-900 shadow-md`;
    } else {
      // Styling for inactive tabs, matching "Users" and "Settings" in image_0.png (transparent bg, lighter text)
      return `${sharedClasses} text-teal-700 hover:text-teal-900`;
    }
  };

  return (
    // Replicating the two-row layout and colors from image_0.png
    <nav className="font-sans">
      
      {/* Top Header Row (Based on image_0.png) */}
      <div className="bg-[#D9F4F0] p-6 border-b border-[#C1E8E2] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#A6E1DB] rounded-full flex items-center justify-center text-teal-900 text-xl font-bold">
            LP
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-950">Lab Performance</h1>
            <p className="text-sm text-teal-800">CSE - Section A</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-bold text-teal-950">Dr. Rahman</div>
            <div className="text-sm text-teal-800">Teacher</div>
          </div>
          <button className="px-6 py-2 border border-teal-900 rounded-full text-teal-950 font-bold hover:bg-white transition-colors">
            Log out
          </button>
        </div>
      </div>

      {/* Lower Navigation Row (Based on user prompt) */}
      <div className="bg-[#D9F4F0] p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {navItems.map(item => (
            <button 
              key={item.name}
              className={getTabClasses(item.name)}
              onClick={() => setActiveTab(item.name)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;