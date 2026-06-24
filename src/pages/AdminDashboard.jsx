import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Trash2, Plus } from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Grades");
  const [showAddLabForm, setShowAddLabForm] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editScores, setEditScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // ডেটা স্টেটস
  const [labs, setLabs] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState({ name: "", email: "", joinToken: "" });

  // নতুন ল্যাব ফর্ম
  const [newLab, setNewLab] = useState({
    title: "Lab 1",
    date: new Date().toISOString().split('T')[0],
    totalProblems: 4
  });
  const [newLabScores, setNewLabScores] = useState({});

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ল্যাব কাউন্ট অনুযায়ী ডিফল্ট টাইটেল
  useEffect(() => {
    if (Array.isArray(labs)) {
      setNewLab(prev => ({ ...prev, title: "Lab " + (labs.length + 1) }));
    }
  }, [labs]);

  // ==========================================
  // ডেটা লোড
  // ==========================================
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // ১. টিচার প্রোফাইল (নাম, ইমেইল)
      const profileRes = await axios.get(`${baseUrl}/auth/me`, config);
      if (profileRes.data?.success) {
        const tData = profileRes.data.data || profileRes.data.result;
        if (tData) {
          setTeacher(prev => ({
            ...prev,
            name: tData.name || "",
            email: tData.email || ""
          }));
        }
      }

      // ২. মূল ডেটা: ল্যাব, স্টুডেন্ট, জয়েন টোকেন
      const overviewRes = await axios.get(`${baseUrl}/admin/overview`, config);
      if (overviewRes.data?.success) {
        const data = overviewRes.data;
        setLabs(data.labs || []);
        setStudents(Array.isArray(data.users) ? data.users : []);
        setTeacher(prev => ({ ...prev, joinToken: data.joinToken || "" }));
      }
    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  // ==========================================
  // হ্যান্ডলার ফাংশন
  // ==========================================

  const handleStudentClick = (student) => {
    if (expandedStudentId === student._id) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(student._id);
      setEditScores({ ...(student.scores || {}) });
    }
  };

  const handleScoreChange = (labId, value, maxProblems) => {
    let numValue = parseInt(value, 10) || 0;
    if (numValue > maxProblems) numValue = maxProblems;
    if (numValue < 0) numValue = 0;
    setEditScores((prev) => ({ ...prev, [labId]: numValue }));
  };

  // মার্কস আপডেট
  const handleUpdateScores = async (studentId) => {
    try {
      const res = await axios.put(
        `${baseUrl}/admin/students/${studentId}/marks`,
        { updatedScores: editScores },
        config
      );

      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentId ? { ...s, scores: { ...editScores } } : s
          )
        );
        setExpandedStudentId(null);
        toast.success("Marks updated successfully!");
      } else {
        toast.error("Failed to update marks");
      }
    } catch (error) {
      console.error("Update marks error:", error);
      toast.error(error.response?.data?.message || "Error updating marks");
    }
  };

  // নতুন ল্যাব যোগ
  const addTodayLab = async () => {
    if (!students || students.length === 0) {
      toast.error("No students found.");
      return;
    }

    const cleanScores = {};
    students.forEach(s => {
      cleanScores[s._id] = newLabScores[s._id] || 0;
    });

    try {
      const res = await axios.post(
        `${baseUrl}/admin/labs`,
        {
          ...newLab,
          scores: cleanScores
        },
        config
      );

      if (res.data?.success) {
        setShowAddLabForm(false);
        setNewLabScores({});
        await fetchDashboardData(); // রিফ্রেশ
        toast.success("Lab entry saved successfully!");
      } else {
        toast.error("Failed to save lab.");
      }
    } catch (error) {
      console.error("Save lab error:", error);
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  // স্টুডেন্ট রিমুভ
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the section?")) return;
    try {
      const res = await axios.delete(`${baseUrl}/admin/users/${studentId}`, config);
      if (res.data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== studentId));
        toast.success("Student removed successfully!");
      }
    } catch (error) {
      toast.error("Failed to remove student.");
    }
  };

  // টোকেন রিজেনারেট
  const handleRegenerateToken = async () => {
    try {
      const res = await axios.post(`${baseUrl}/admin/token/regenerate`, {}, config);
      if (res.data.success && res.data.joinToken) {
        setTeacher(prev => ({ ...prev, joinToken: res.data.joinToken }));
        toast.success("Token regenerated successfully!");
      }
    } catch (error) {
      toast.error("Failed to regenerate token.");
    }
  };

  // সেকশন ক্লিয়ার
  const handleClearSection = async () => {
    if (!window.confirm("⚠️ Danger! Are you sure you want to permanently remove all students and their scores? This cannot be undone.")) return;
    try {
      const res = await axios.post(`${baseUrl}/admin/danger/clear`, {}, config);
      if (res.data.success) {
        setStudents([]);
        setLabs([]);
        toast.success("Section data cleared successfully!");
      }
    } catch (error) {
      toast.error("Failed to clear section.");
    }
  };

  // ==========================================
  // ইউটিলিটি: টোটাল ক্যালকুলেশন
  // ==========================================
  const calculateTotal = (studentScores) => {
    const safeScores = studentScores || {};
    if (!labs || !labs.length) return { totalSolved: 0, totalPossible: 0, percentage: 0 };

    let totalSolved = 0;
    labs.forEach(lab => {
      if (lab && lab._id) {
        totalSolved += (safeScores[lab._id] || 0);
      }
    });
    const totalPossible = labs.reduce((sum, lab) => sum + (lab?.totalProblems || 0), 0);
    const percentage = totalPossible > 0 ? Math.round((totalSolved / totalPossible) * 25) : 0;
    return { totalSolved, totalPossible, percentage };
  };

  // ==========================================
  // রেন্ডার
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E0FEF9] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mx-auto" />
          <p className="text-sm font-semibold text-teal-900">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0FEF9] font-sans text-teal-950 pb-12">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ট্যাব নেভিগেশন */}
        <div className="flex items-center gap-2 bg-[#D1F7F1]/60 p-1.5 rounded-2xl w-fit border border-teal-100/30 shadow-inner">
          {["Grades", "Students", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab ? "bg-white text-teal-950 shadow-md" : "text-teal-800/70 hover:text-teal-950 hover:bg-white/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ======== গ্রেডস ট্যাব ======== */}
        {activeTab === "Grades" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Grades Dashboard</h2>
                <p className="text-xs text-gray-500 mt-0.5">Edit marks inline, or log today's lab for the whole section.</p>
              </div>
              {!showAddLabForm && (
                <button
                  onClick={() => setShowAddLabForm(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
                >
                  <Plus className="w-4 h-4" /> Add today's lab
                </button>
              )}
            </div>

            {/* অ্যাড ল্যাব ফর্ম */}
            {showAddLabForm && (
              <div className="bg-white p-6 rounded-2xl border border-teal-100/40 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h2 className="text-sm font-bold text-gray-800">New Lab — Create entry for entire class</h2>
                  <button onClick={() => setShowAddLabForm(false)} className="text-xs font-semibold text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Lab Title</label>
                    <input
                      type="text"
                      value={newLab.title}
                      onChange={e => setNewLab({...newLab, title: e.target.value})}
                      className="w-full bg-[#EDFBF8] border border-teal-100/50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={newLab.date}
                      onChange={e => setNewLab({...newLab, date: e.target.value})}
                      className="w-full bg-[#EDFBF8] border border-teal-100/50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Problems</label>
                    <input
                      type="number"
                      value={newLab.totalProblems}
                      onChange={e => setNewLab({...newLab, totalProblems: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#EDFBF8] border border-teal-100/50 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* স্টুডেন্টদের স্কোর ইনপুট */}
                <div className="border border-teal-50 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                  <div className="grid grid-cols-3 bg-[#EDFBF8] p-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                    <div>Student Name</div>
                    <div>Email</div>
                    <div className="text-right">Solved / {newLab.totalProblems}</div>
                  </div>
                  {students?.map((student) => (
                    <div key={student._id} className="grid grid-cols-3 p-3 items-center font-semibold">
                      <div className="font-bold text-gray-800">{student.name}</div>
                      <div className="text-gray-400 font-normal">{student.email}</div>
                      <div className="flex justify-end">
                        <input
                          type="number"
                          min="0"
                          max={newLab.totalProblems}
                          value={newLabScores[student._id] || 0}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 0;
                            if (val > newLab.totalProblems) val = newLab.totalProblems;
                            if (val < 0) val = 0;
                            setNewLabScores({...newLabScores, [student._id]: val});
                          }}
                          className="w-16 text-center border border-teal-200 rounded-lg py-1 bg-[#EDFBF8] font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                  <button onClick={() => setShowAddLabForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={addTodayLab} className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 shadow-md select-none">Save Lab Entry</button>
                </div>
              </div>
            )}

            {/* মূল গ্রেড টেবিল (অ্যাকর্ডিয়ন) */}
            <div className="bg-white rounded-2xl border border-teal-100/40 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#EDFBF8] border-b border-teal-100/30 text-[11px] text-gray-400 font-bold uppercase tracking-wider select-none">
                    <th className="py-4 px-6 text-teal-950 font-bold normal-case text-xs w-[250px]">Student</th>
                    {labs?.map((lab) => (
                      <th key={lab._id} className="py-3 px-4 text-center">
                        <div className="text-gray-700 font-bold text-xs normal-case">{lab.title}</div>
                        <div className="text-[10px] font-normal text-gray-400 lowercase">{lab.date || "N/A"} · /{lab.totalProblems}</div>
                      </th>
                    ))}
                    <th className="py-3 px-6 text-right text-teal-950 font-bold normal-case text-xs">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-teal-950 divide-y divide-gray-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={(labs?.length || 0) + 2} className="py-8 text-center text-gray-400 font-normal">
                        No students enrolled in this section yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const { totalSolved, totalPossible, percentage } = calculateTotal(student.scores);
                      const isExpanded = expandedStudentId === student._id;
                      return (
                        <React.Fragment key={student._id}>
                          <tr
                            onClick={() => handleStudentClick(student)}
                            className={`hover:bg-cyan-50/20 cursor-pointer transition-colors ${isExpanded ? "bg-cyan-50/30" : ""}`}
                          >
                            <td className="py-4 px-6 font-bold text-gray-800 text-sm">
                              {student.name}
                              <div className="text-[12px] text-gray-500 font-medium mt-0.5">{student.email.split("@")[0]}</div>
                              <div className="text-[10px] text-gray-400 font-normal mt-0.5">Click to view/edit marks</div>
                            </td>
                            {labs?.map((lab) => (
                              <td key={lab._id} className="py-4 px-4 text-center">
                                <span className="inline-block w-12 py-1 border border-teal-100 bg-[#EDFBF8] rounded-full font-bold text-gray-700">
                                  {student.scores ? (student.scores[lab._id] ?? 0) : 0}
                                </span>
                              </td>
                            ))}
                            <td className="py-4 px-6 text-right">
                              <div className="font-bold text-sm text-cyan-700">{totalSolved}/{totalPossible}</div>
                              <div className="text-[10px] text-gray-400 font-medium">{percentage} Mark</div>
                            </td>
                          </tr>

                          {/* এক্সপান্ডেড এডিটর */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={(labs?.length || 0) + 2} className="bg-gray-50/60 p-5 border-y border-teal-50/50">
                                <div className="flex flex-col gap-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="font-bold text-gray-800 text-sm">Modify scores for {student.name}</h3>
                                      <p className="text-[11px] text-gray-400 font-medium">Changes will be saved directly</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => setExpandedStudentId(null)} className="px-3 py-2 bg-white border border-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50">Cancel</button>
                                      <button onClick={() => handleUpdateScores(student._id)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-sm">Update Marks</button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {labs?.map((lab) => (
                                      <div key={lab._id} className="flex flex-col items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-20">
                                        <span className="text-[10px] font-bold text-gray-400 mb-1 truncate w-full text-center">{lab.title}</span>
                                        <input
                                          type="number"
                                          value={editScores[lab._id] ?? 0}
                                          onChange={(e) => handleScoreChange(lab._id, e.target.value, lab.totalProblems)}
                                          className="w-full text-center font-bold text-sm bg-[#EDFBF8] border border-teal-100 rounded-lg py-1 focus:outline-none"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======== স্টুডেন্টস ট্যাব ======== */}
        {activeTab === "Students" && (
          <div className="bg-white rounded-2xl border border-teal-100/40 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EDFBF8] border-b border-teal-100/40 text-sm font-bold text-teal-950 select-none">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-teal-950">
                {students?.map((student) => (
                  <tr key={student._id} className="hover:bg-teal-50/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-700">{student.name}</td>
                    <td className="py-4 px-6 font-medium text-gray-400">{student.email}</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {student.email.split('@')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemoveStudent(student._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1 ml-auto font-bold text-xs"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <p className="text-center text-xs p-8 text-gray-400">No students enrolled in this section yet.</p>
            )}
          </div>
        )}

        {/* ======== সেটিংস ট্যাব ======== */}
        {activeTab === "Settings" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-teal-100/40 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-teal-950">Section Access Token</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Provide this token to students. They will match this token to view their profile dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="bg-[#E4FAF6] border border-teal-100 text-teal-950 font-bold text-sm px-5 py-3 rounded-xl min-w-64 tracking-wider uppercase text-center sm:text-left">
                  {teacher?.joinToken || "NO-TOKEN-ACTIVE"}
                </div>
                <button
                  onClick={handleRegenerateToken}
                  className="px-5 py-3 border border-teal-200 hover:bg-teal-50 text-teal-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Token
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-red-600">Danger Zone Operations</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Irreversible actions. This will completely wipe student scores or reset structural properties.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearSection}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                >
                  Clear Entire Section
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;