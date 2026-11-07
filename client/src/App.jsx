import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, ShieldCheck, Search, PlusCircle, LogOut, FileText, Users, MapPin, Clock, DollarSign, ChevronRight, CheckCircle, X, Upload, Filter, Check, AlertCircle, Trash2, Eye, Download, Mail, Bell, Settings, Award } from 'lucide-react';

const API_BASE = "https://local-connect-api-t9jx.onrender.com";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('local_connect_user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('local_connect_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJobForApp, setSelectedJobForApp] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('companies');
  const [newJob, setNewJob] = useState({ title: '', companyName: '', category: 'IT / Web Dev', type: 'OJT / Internship', mode: 'On-site', location: '', stipend: '', description: '' });

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === 'student') fetchStudentApplications();
      if (currentUser.role === 'employer') fetchEmployerApplications();
      if (currentUser.role === 'admin') fetchAdminCompanies();
      fetchNotifications();
    }
  }, [currentUser, token]);

  const fetchJobs = async () => { try { const res = await fetch(`${API_BASE}/api/jobs`); if (res.ok) setJobs(await res.json()); } catch (err) {} };
  const fetchStudentApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/student`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchEmployerApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/employer`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchAdminCompanies = async () => { try { const res = await fetch(`${API_BASE}/api/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setCompanies(await res.json()); } catch (err) {} };
  const fetchNotifications = async () => { try { const res = await fetch(`${API_BASE}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setNotifications(await res.json()); } catch (err) {} };

  const handleLogin = async (e, demoEmail = null, demoPass = null) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail || email, password: demoPass || password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('local_connect_user', JSON.stringify(data.user));
        localStorage.setItem('local_connect_token', data.token);
      } else {
        setLoginError(data.error || 'Login failed.');
      }
    } catch (err) {
      setLoginError('Could not connect to backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('local_connect_user');
    localStorage.removeItem('local_connect_token');
    setEmail('');
    setPassword('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobForApp) return;
    const formData = new FormData();
    formData.append('jobId', selectedJobForApp.id);
    if (resumeFile) formData.append('resume', resumeFile);
    try {
      const res = await fetch(`${API_BASE}/api/applications`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { alert('Application and resume submitted successfully!'); setSelectedJobForApp(null); setResumeFile(null); fetchStudentApplications(); fetchNotifications(); }
    } catch (err) {}
  };

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newJob)
      });
      if (res.ok) { alert('Job listing published successfully!'); setIsPostJobOpen(false); fetchJobs(); }
    } catch (err) {}
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { alert('Job deleted.'); fetchJobs(); }
    } catch (err) {}
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchEmployerApplications();
        fetchNotifications();
        alert(`Status updated to "${newStatus}". Notification dispatched to student.`);
      }
    } catch (err) {}
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}/verify`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchAdminCompanies();
    } catch (err) {}
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/export-csv`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LocalConnect_Placement_Report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {}
  };

  const updateTargetHours = async (targetVal) => {
    try {
      const res = await fetch(`${API_BASE}/api/student/hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetHours: targetVal })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...currentUser, totalRequiredHours: data.totalRequiredHours };
        setCurrentUser(updatedUser);
        localStorage.setItem('local_connect_user', JSON.stringify(updatedUser));
      }
    } catch (err) {}
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || j.category === selectedCategory;
    const matchesType = selectedType === 'All' || j.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20"><Briefcase className="w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Local Connect</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">CapStone Portal Sign In</p>
            </div>
          </div>
          {loginError && <div className="mb-4 p-3 bg-red-950/60 text-red-400 rounded-xl text-xs font-semibold border border-red-900/50 text-center flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /><span>{loginError}</span></div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. student@icct.edu.ph" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none text-slate-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none text-slate-100 transition-all" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm mt-2 disabled:opacity-50">{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
            <p className="font-bold text-slate-300 mb-2.5">Click to Quick-Login Demo Accounts:</p>
            <div className="space-y-2">
              <button type="button" onClick={() => handleLogin(null, 'student@icct.edu.ph', 'password123')} className="w-full p-2.5 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-900/40 text-blue-300 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Student: student@icct.edu.ph</span><ChevronRight className="w-4 h-4" /></button>
              <button type="button" onClick={() => handleLogin(null, 'hr@techsolutions.com', 'password123')} className="w-full p-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/40 text-emerald-300 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Employer: hr@techsolutions.com</span><ChevronRight className="w-4 h-4" /></button>
              <button type="button" onClick={() => handleLogin(null, 'admin@localconnect.gov.ph', 'password123')} className="w-full p-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/40 text-purple-300 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Admin: admin@localconnect.gov.ph</span><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-2 rounded-xl shadow-md shadow-blue-500/20"><Briefcase className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Local Connect</h2>
              <span className="text-[11px] font-semibold text-slate-400 capitalize">{currentUser.role} Workspace</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">{unreadCount}</span>}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400">{currentUser.email}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"><LogOut className="w-3.5 h-3.5" /><span>Logout</span></button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer / Dropdown */}
      {isNotificationsOpen && (
        <div className="absolute right-4 top-20 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 z-50 p-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Notifications & Status Updates</h4>
            <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => handleMarkNotificationRead(n.id)} className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${n.read ? 'bg-slate-950/40 border-slate-800/80 opacity-60' : 'bg-blue-950/40 border-blue-800/60 shadow-md'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{n.subject}</span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{n.body}</p>
                  {!n.read && <span className="inline-block mt-1.5 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentUser.role === 'student' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 pointer-events-none"></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {currentUser.name}!</h2>
            <p className="mt-2 text-blue-100 text-sm">Discover verified local internships and entry-level positions tailored for IT students.</p>
          </div>

          {/* Futuristic OJT Program & Hours Tracker Card */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OJT Internship Progress</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">Select Required Program Target</h3>
              </div>
              
              {/* Futuristic Hour Tier Selector Pills */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                {[243, 400, 600].map((tier) => {
                  const isActive = (currentUser.totalRequiredHours || 500) === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => updateTargetHours(tier)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {tier} Hours
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-400">
                  {currentUser.completedHours || 120} / {currentUser.totalRequiredHours || 500} Hours Completed
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {Math.min(100, Math.round(((currentUser.completedHours || 120) / (currentUser.totalRequiredHours || 500)) * 100))}% Finished
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50" style={{ width: `${Math.min(100, ((currentUser.completedHours || 120) / (currentUser.totalRequiredHours || 500)) * 100)}%` }}></div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={async () => {
                    const hours = prompt("Enter hours to log (e.g., 8):", "8");
                    if (!hours || isNaN(hours)) return;
                    try {
                      const res = await fetch(`${API_BASE}/api/student/hours`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ hoursToAdd: hours })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        const updatedUser = { ...currentUser, completedHours: data.completedHours, totalRequiredHours: data.totalRequiredHours };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('local_connect_user', JSON.stringify(updatedUser));
                        alert('Hours logged successfully!');
                      }
                    } catch (err) {}
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  + Log Daily Hours
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 border border-slate-800 shadow-xl sticky top-24">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navigation</h3>
                <nav className="space-y-1 mb-6">
                  <button onClick={() => setActiveTab('browse')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-blue-950/60 text-blue-400 font-semibold border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><div className="flex items-center space-x-3"><Search className="w-4 h-4" /><span>Browse Jobs</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                  <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-blue-950/60 text-blue-400 font-semibold border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><div className="flex items-center space-x-3"><FileText className="w-4 h-4" /><span>My Applications</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                </nav>
              </div>
            </aside>
            <section className="lg:col-span-3">
              {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <h4 className="text-base font-bold text-white">{job.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{job.companyName} • {job.location}</p>
                        <p className="text-xs text-slate-300 mt-3 leading-relaxed">{job.description}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                        <span className="text-sm font-bold text-emerald-400">{job.stipend}</span>
                        <button onClick={() => setSelectedJobForApp(job)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20">Apply Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'applications' && (
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4">My Submitted Applications</h3>
                  {applications.map(app => (
                    <div key={app.id} className="py-4 flex items-center justify-between border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.jobTitle}</h4>
                        <p className="text-xs text-slate-400">{app.companyName} • Status: <strong className="text-blue-400">{app.status}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {currentUser.role === 'employer' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Employer Recruitment Hub</h2>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 font-bold text-sm text-slate-200">Manage Applicant Statuses & Resumes</div>
            <div className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No applicants yet.</p>
              ) : (
                applications.map(appItem => (
                  <div key={appItem.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{appItem.studentName}</h4>
                      <p className="text-xs text-slate-400">Applied for: <strong className="text-slate-200">{appItem.jobTitle}</strong> ({appItem.studentEmail})</p>
                      <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold text-blue-400">{appItem.status}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={`${API_BASE}${appItem.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900 text-blue-400 border border-blue-900/50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"><Eye className="w-3.5 h-3.5" /> View Resume</a>
                      <button onClick={() => handleUpdateAppStatus(appItem.id, 'Interview Scheduled')} className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-400 border border-purple-900/50 rounded-xl text-xs font-semibold transition-colors">Schedule Interview</button>
                      <button onClick={() => handleUpdateAppStatus(appItem.id, 'Accepted')} className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/50 rounded-xl text-xs font-semibold transition-colors">Accept</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      )}

      {currentUser.role === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
              <p className="text-xs text-slate-400 mt-1">Manage partner companies, verifications, and platform job listings.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPostJobOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20"><PlusCircle className="w-4 h-4" /><span>Post Opening</span></button>
              <button onClick={handleExportCSV} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-purple-600/20"><Download className="w-4 h-4" /><span>Export CSV</span></button>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-slate-800 pb-4">
            <button onClick={() => setAdminTab('companies')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'companies' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>Partner Companies</button>
            <button onClick={() => setAdminTab('listings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'listings' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>Platform Job Listings ({jobs.length})</button>
          </div>

          {adminTab === 'companies' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 font-bold text-sm text-slate-200">Partner Company Verifications</div>
              <div className="divide-y divide-slate-800">
                {companies.map(comp => (
                  <div key={comp.id} className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{comp.name}</h4>
                      <p className="text-xs text-slate-400">{comp.industry} • {comp.location} • Status: <strong className={comp.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}>{comp.status}</strong></p>
                    </div>
                    {comp.status !== 'Verified' && (
                      <button onClick={() => handleVerifyCompany(comp.id)} className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/50 text-xs font-semibold rounded-xl transition-colors">Verify Company</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === 'listings' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 font-bold text-sm text-slate-200">All Published Platform Job Listings</div>
              <div className="divide-y divide-slate-800">
                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No listings published yet.</p>
                ) : (
                  jobs.map(job => (
                    <div key={job.id} className="p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{job.title}</h4>
                        <p className="text-xs text-slate-400">{job.companyName} • {job.location} • <strong className="text-emerald-400">{job.stipend}</strong></p>
                      </div>
                      <button onClick={() => handleDeleteJob(job.id)} className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {selectedJobForApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Apply to {selectedJobForApp.companyName}</h3>
              <button onClick={() => setSelectedJobForApp(null)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Position</label>
                <input type="text" disabled value={selectedJobForApp.title} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-300 font-semibold border border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Upload Resume (PDF)</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-950 file:text-blue-400 hover:file:bg-blue-900" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {isPostJobOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Post New Internship / Job Opening</h3>
              <button onClick={() => setIsPostJobOpen(false)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Title</label>
                <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Junior Web Developer OJT" className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Company Name</label>
                <input type="text" required value={newJob.companyName} onChange={(e) => setNewJob({...newJob, companyName: e.target.value})} placeholder="e.g. TechSolutions Inc." className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                  <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. San Mateo, Rizal" className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Stipend / Allowance</label>
                  <input type="text" required value={newJob.stipend} onChange={(e) => setNewJob({...newJob, stipend: e.target.value})} placeholder="e.g. PHP 500 / day" className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                <textarea rows="3" required value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Job description and requirements..." className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 mt-2">Publish Opening</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}