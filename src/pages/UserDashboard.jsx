import React, { useState, useEffect } from "react";
import { Loader2, Award, BookOpen, RefreshCw, LogIn } from "lucide-react"; // LogIn আইকন যোগ করলাম
import axios from "axios";
import toast from 'react-hot-toast';
const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [labHistory, setLabHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

    // জয়েন করার ফাংশন
const handleJoinSection = async () => {
  try {
    setIsJoining(true);
    const response = await axios.post(`${baseUrl}/user/join`, { joinToken: joinCode }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    
    // সাকসেস টোস্ট
    toast.success("Successfully joined the section!");
    
    // সরাসরি ড্যাশবোর্ড ডেটা রিফ্রেশ করা
    await fetchDashboardData(); 
  } catch (err) {
    console.error("Join section error:", err);
    // এরর টোস্ট
    toast.error("Failed to join. Please check your join code and try again.");
  } finally {
    setIsJoining(false);
  }
};

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        setIsLoading(false);
        return;
      }

      // তোমার রিয়েল রাউট অনুযায়ী এপিআই কল
      const response = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // তোমার এপিআই রেসপন্স অবজেক্ট 'result' চেক করা হচ্ছে
      if (response.data && response.data.result) {
        console.log(response.data);
        
        const { 
          user, 
          user_labs, 
          all_students_profile_in_this_section,
          total_problems,
          solved_problems
        } = response.data.result;

        // ১. কারেন্ট ইউজার ইনফো সেট করা
        setCurrentUser(user);

        // ২. ওভারঅল পার্সেন্টেজ হিসাব করা
        const overallPercentage = total_problems > 0 
          ? Math.round((solved_problems / total_problems) * 100) 
          : 0;

        // ৩. স্ট্যাটস কার্ডস ডেটা সেট করা
        const labsCompletedCount = Array.isArray(user_labs) 
          ? user_labs.filter(lab => lab?.marks > 0).length.toString() 
          : "0";

        setStats([
          { 
            title: "Problems solved", 
            value: `${solved_problems || 0}/${total_problems || 0}`, 
            isActive: false 
          },
          { 
            title: "Overall score", 
            value: `${overallPercentage}%`, 
            isActive: true 
          },
          { 
            title: "Labs completed", 
            value: labsCompletedCount, 
            isActive: false 
          },
        ]);

        // ৪. ল্যাব হিস্ট্রি ফরম্যাটিং (তোমার 'user_labs' অ্যারে অনুযায়ী)
// ৪. ল্যাব হিস্ট্রি ফরম্যাটিং (আপডেট করুন)
const formattedLabs = (user_labs || []).map((lab) => ({
  id: lab?.labId?.title + lab?.labId?.date,
  name: lab?.labId?.title || "Unknown Lab", 
  date: lab?.labId?.date ? new Date(lab.labId.date).toLocaleDateString('en-CA') : "N/A",
  solved: `${lab?.score || 0}/${lab?.labId?.totalProblems || 0}`,
  marks: lab?.labId?.totalProblems > 0 
    ? Math.round((lab.score / lab.labId.totalProblems) * 100) 
    : 0
}));
setLabHistory(formattedLabs);

        // ৫. লিডারবোর্ড ফরম্যাটিং (তোমার 'all_students_profile_in_this_section' অনুযায়ী)
        // সলভড প্রবলেমের ওপর ভিত্তি করে ডিসেন্ডিং অর্ডারে সর্ট করা হচ্ছে
        const sortedStudents = [...(all_students_profile_in_this_section || [])].sort(
          (a, b) => (b?.solved_problems || 0) - (a?.solved_problems || 0)
        );

        const formattedLeaderboard = sortedStudents.map((student, index) => {
          const studentPercentage = total_problems > 0 
            ? Math.round(((student?.solved_problems || 0) / total_problems) * 100) 
            : 0;

          const isMe = student?.userId?._id === user?._id || student?._id === user?._id;

          return {
            rank: `#${index + 1}`,
            name: student?.userId?.name || "Student", 
            isCurrentUser: isMe,
            problems: `${student?.solved_problems || 0}/${total_problems || 0} problems`,
            percentage: studentPercentage
          };
        });
        setLeaderboard(formattedLeaderboard);
      } else {
        setError("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getMarkBadgeClass = (marks) => {
    if (marks >= 80) return "bg-emerald-100 text-emerald-800 border border-emerald-200"; 
    if (marks >= 50) return "bg-teal-50 text-teal-700 border border-teal-100"; 
    if (marks > 0) return "bg-amber-50 text-amber-700 border border-amber-100";
    return "bg-gray-100 text-gray-500 border border-gray-200"; 
  };
if (isLoading) return <div className="min-h-screen bg-[#E0FEF9] flex items-center justify-center">Loading...</div>; 
// জয়েন না করা থাকলে এই UI দেখাবে:
  if (currentUser && !currentUser.teacherId) {
    return (
      <div className="min-h-screen bg-[#E0FEF9] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-teal-100 shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-teal-950 mb-2">Join a Section</h2>
          <p className="text-sm text-gray-500 mb-6">Enter the join code provided by your teacher to join the section.</p>
          
          <input 
            type="text" 
            placeholder="Enter Join Code" 
            className="w-full bg-[#EDFBF8] border border-teal-200 px-4 py-3 rounded-xl mb-4 font-bold uppercase focus:outline-none"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          
          <button 
            onClick={handleJoinSection}
            disabled={isJoining}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            {isJoining ? "Joining..." : "Join Section"}
          </button>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E0FEF9] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mx-auto" />
          <p className="text-sm font-semibold text-teal-900">Loading your profile & lab stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E0FEF9] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-md max-w-md w-full text-center space-y-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0FEF9] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-teal-950">Welcome back, {currentUser?.name || "Student"}!</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Section: <span className="font-semibold text-teal-800">{currentUser?.sectionId?.name || "C"}</span>
            </p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="self-start sm:self-auto p-2 bg-white hover:bg-teal-50 border border-teal-100/80 rounded-xl transition-colors shadow-sm text-gray-600"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-2xl border border-teal-100/50 shadow-sm transition-all duration-200 ${
                stat.isActive 
                  ? "bg-[#99EADF] text-teal-950 shadow-md scale-[1.01]" 
                  : "bg-white text-gray-800 hover:border-teal-200"
              }`}
            >
              <p className={`text-xs font-semibold tracking-wide uppercase ${stat.isActive ? "text-teal-900/80" : "text-gray-400"}`}>
                {stat.title}
              </p>
              <p className="text-3xl font-bold mt-2 tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* LAB HISTORY */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-teal-950 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600" /> Your lab history
          </h2>
          
          <div className="bg-white rounded-2xl border border-teal-100/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                    <th className="py-3.5 px-6">Lab</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-center">Solved</th>
                    <th className="py-3.5 px-6 text-center">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                  {labHistory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 font-normal">
                        No labs found in this section.
                      </td>
                    </tr>
                  ) : (
                    labHistory.map((lab) => (
                      <tr key={lab.id} className="hover:bg-teal-50/10 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-800">{lab.name}</td>
                        <td className="py-4 px-6 text-gray-400 font-normal">{lab.date}</td>
                        <td className="py-4 px-6 text-center tabular-nums text-gray-600">{lab.solved}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold min-w-[45px] text-center ${getMarkBadgeClass(lab.marks)}`}>
                            {lab.marks}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-teal-950 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-600" /> Section leaderboard
          </h2>
          
          <div className="bg-white rounded-2xl border border-teal-100/40 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-normal">
                No active students found in this section leaderboard.
              </div>
            ) : (
              leaderboard.map((student, i) => (
                <div 
                  key={i} 
                  className={`p-4 px-6 flex items-center justify-between transition-colors ${
                    student.isCurrentUser ? "bg-[#E4FAF6]/60 font-medium" : "hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className={`text-sm font-bold w-6 ${i === 0 ? "text-cyan-600" : "text-gray-400"}`}>
                      {student.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-sm">{student.name}</h3>
                        {student.isCurrentUser && (
                          <span className="bg-cyan-500 text-white font-extrabold tracking-wide text-[9px] px-1.5 py-0.5 rounded-md shadow-sm shadow-cyan-500/10 uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{student.problems}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-1/2 sm:w-1/3 md:w-1/4 justify-end">
                    <div className="w-full bg-gray-100 h-2 rounded-full hidden sm:block overflow-hidden border border-gray-200/20">
                      <div 
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${student.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-teal-950 tabular-nums min-w-[40px] text-right">
                      {student.percentage}%
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;