import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, ShieldCheck, Search, PlusCircle, LogOut, FileText, Users, MapPin, Clock, DollarSign, ChevronRight, CheckCircle, X, Upload, Filter, Check, AlertCircle, Trash2, Eye, Download, MessageSquare, Send, Mail } from 'lucide-react';

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
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJobForApp, setSelectedJobForApp] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [viewResumeUrl, setViewResumeUrl] = useState(null);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', companyName: '', category: 'IT / Web Dev', type: 'OJT / Internship', mode: 'On-site', location: '', stipend: '', description: '' });

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === 'student') fetchStudentApplications();
      if (currentUser.role === 'employer') fetchEmployerApplications();
      if (currentUser.role === 'admin') fetchAdminCompanies();
      fetchMessages();
      fetchNotifications();
    }
  }, [currentUser, token]);

  const fetchJobs = async () => { try { const res = await fetch(`${API_BASE}/api/jobs`); if (res.ok) setJobs(await res.json()); } catch (err) {} };
  const fetchStudentApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/student`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchEmployerApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/employer`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchAdminCompanies = async () => { try { const res = await fetch(`${API_BASE}/api/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setCompanies(await res.json()); } catch (err) {} };
  const fetchMessages = async () => { try { const res = await fetch(`${API_BASE}/api/messages`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setMessages(await res.json()); } catch (err) {} };
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatRecipient || !chatMessageText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: chatRecipient.id, text: chatMessageText })
      });
      if (res.ok) {
        setChatMessageText('');
        fetchMessages();
      }
    } catch (err) {}
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobForApp) return;
    const formData = new FormData();
    formData.append('jobId', selectedJobForApp.id);
    if (resumeFile) formData.append('resume', resumeFile);
    try {
      const res = await fetch(`${API_BASE}/api/applications`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { alert('Application and resume submitted!'); setSelectedJobForApp(null); setResumeFile(null); fetchStudentApplications(); }
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
      if (res.ok) { alert('Job posted!'); setIsPostJobOpen(false); fetchJobs(); }
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
        alert(`Status updated to ${newStatus}. Simulated email notification dispatched to student!`);
      }
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

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || j.category === selectedCategory;
    const matchesType = selectedType === 'All' || j.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30"><Briefcase className="w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-none">Local Connect</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">CapStone Portal Sign In</p>
            </div>
          </div>
          {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 text-center flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /><span>{loginError}</span></div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. student@icct.edu.ph" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm mt-2 disabled:opacity-50">{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-bold text-slate-700 mb-2">Click to Quick-Login Demo Accounts:</p>
            <div className="space-y-2">
              <button type="button" onClick={() => handleLogin(null, 'student@icct.edu.ph', 'password123')} className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Student: student@icct.edu.ph</span><ChevronRight className="w-4 h-4" /></button>
              <button type="button" onClick={() => handleLogin(null, 'hr@techsolutions.com', 'password123')} className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Employer: hr@techsolutions.com</span><ChevronRight className="w-4 h-4" /></button>
              <button type="button" onClick={() => handleLogin(null, 'admin@localconnect.gov.ph', 'password123')} className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-left font-mono text-[11px] font-semibold transition-colors flex justify-between items-center"><span>Admin: admin@localconnect.gov.ph</span><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20"><Briefcase className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Local Connect</h2>
              <span className="text-[11px] font-semibold text-slate-400 capitalize">{currentUser.role} Workspace</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              <Mail className="w-4 h-4" />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{notifications.length}</span>}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400">{currentUser.email}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"><LogOut className="w-3.5 h-3.5" /><span>Logout</span></button>
          </div>
        </div>
      </header>

      {currentUser.role === 'student' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {currentUser.name}!</h2>
            <p className="mt-2 text-blue-100 text-sm">Discover verified local internships and entry-level positions tailored for IT students.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">OJT Internship Progress</span>
                <span className="text-xs font-bold text-blue-600">
                  {currentUser.completedHours || 120} / {currentUser.totalRequiredHours || 500} Hours Logged
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentUser.completedHours || 120) / (currentUser.totalRequiredHours || 500)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={async () => {
                const hours = prompt("Enter hours to add (e.g., 8):", "8");
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
                    alert('Hours updated successfully!');
                  }
                } catch (err) {}
              }}
              className="whitespace-nowrap px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              + Log Daily Hours
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm sticky top-24">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navigation</h3>
                <nav className="space-y-1 mb-6">
                  <button onClick={() => setActiveTab('browse')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}><div className="flex items-center space-x-3"><Search className="w-4 h-4" /><span>Browse Jobs</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                  <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}><div className="flex items-center space-x-3"><FileText className="w-4 h-4" /><span>My Applications</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                  <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}><div className="flex items-center space-x-3"><MessageSquare className="w-4 h-4" /><span>Messages</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                </nav>
              </div>
            </aside>
            <section className="lg:col-span-3">
              {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{job.companyName} • {job.location}</p>
                        <p className="text-xs text-slate-600 mt-3">{job.description}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                        <span className="text-sm font-bold text-emerald-600">{job.stipend}</span>
                        <button onClick={() => setSelectedJobForApp(job)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">Apply Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'applications' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">My Submitted Applications</h3>
                  {applications.map(app => (
                    <div key={app.id} className="py-4 flex items-center justify-between border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                        <p className="text-xs text-slate-500">{app.companyName} • Status: <strong className="text-blue-600">{app.status}</strong></p>
                      </div>
                      <button onClick={() => { setChatRecipient({ id: '2', name: app.companyName }); setActiveTab('messages'); }} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Chat HR</button>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 h-[500px] flex flex-col overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">Live Chat with HR / Employer</div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.filter(m => m.senderId === currentUser.userId || m.recipientId === currentUser.userId).map(m => (
                      <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.userId ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs ${m.senderId === currentUser.userId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                          <p>{m.text}</p>
                          <span className="text-[9px] opacity-70 mt-1 block text-right">{m.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                    <input type="text" value={chatMessageText} onChange={(e) => setChatMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Send</button>
                  </form>
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {currentUser.role === 'employer' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Employer Recruitment Hub</h2>
            <button onClick={() => setIsPostJobOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm"><PlusCircle className="w-4 h-4" /><span>Post Opening</span></button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">My Posted Job Listings</h3>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-semibold">{jobs.filter(j => j.employerId === currentUser.id || j.companyName === currentUser.name).length} Listings</span>
            </div>
            <div className="divide-y divide-slate-100">
              {jobs.filter(j => j.employerId === currentUser.id || j.companyName === currentUser.name).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No listings posted yet.</p>
              ) : (
                jobs.filter(j => j.employerId === currentUser.id || j.companyName === currentUser.name).map(job => (
                  <div key={job.id} className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-500">{job.category} • {job.location} • <strong className="text-emerald-600">{job.stipend}</strong></p>
                    </div>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Employer Messaging & Applicant Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:col-span-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Applicants & Chats</h3>
              <div className="space-y-2">
                {applications.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setChatRecipient({ id: app.studentId, name: app.studentName })}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${chatRecipient?.id === app.studentId ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'}`}
                  >
                    <div>
                      <p className="text-xs font-bold">{app.studentName}</p>
                      <p className="text-[10px] opacity-80">{app.jobTitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 h-[500px] flex flex-col overflow-hidden shadow-sm lg:col-span-2">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
                Chat with: {chatRecipient ? chatRecipient.name : 'Select an applicant from the left'}
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {!chatRecipient ? (
                  <p className="text-xs text-slate-400 text-center py-20">Click an applicant to chat directly.</p>
                ) : (
                  messages
                    .filter(m => (m.senderId === currentUser.userId && m.recipientId === chatRecipient.id) || (m.senderId === chatRecipient.id && m.recipientId === currentUser.userId))
                    .map(m => (
                      <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.userId ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs ${m.senderId === currentUser.userId ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200 shadow-sm'}`}>
                          <p>{m.text}</p>
                          <span className="text-[9px] opacity-70 mt-1 block text-right">{m.timestamp}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
              {chatRecipient && (
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
                  <input type="text" value={chatMessageText} onChange={(e) => setChatMessageText(e.target.value)} placeholder={`Reply to ${chatRecipient.name}...`} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Send</button>
                </form>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm mt-8">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-bold text-sm">Manage Applicant Status</div>
            <div className="divide-y divide-slate-100">
              {applications.map(appItem => (
                <div key={appItem.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{appItem.studentName}</h4>
                    <p className="text-xs text-slate-500">Applied for: {appItem.jobTitle} ({appItem.status})</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setViewResumeUrl(`${API_BASE}${appItem.resumeUrl}`)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Resume</button>
                    <button onClick={() => handleUpdateAppStatus(appItem.id, 'Interview Scheduled')} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl">Interview</button>
                    <button onClick={() => handleUpdateAppStatus(appItem.id, 'Hired')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl">Hire</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentUser.role === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Placement Coordinator Admin Portal</h2>
            <button onClick={handleExportCSV} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"><Download className="w-4 h-4" /> Export Report (CSV)</button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-bold text-sm">Employer Verification Queue</div>
            <div className="divide-y divide-slate-100">
              {companies.map((company) => (
                <div key={company.id} className="p-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{company.name}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${company.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{company.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{company.industry} • {company.location}</p>
                  </div>
                  {company.status !== 'Verified' && (
                    <button onClick={() => handleVerifyCompany(company.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Approve Verification
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" /> Simulated Email Inbox</h3>
              <button onClick={() => setIsNotificationsOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-xs font-bold text-slate-900">{n.subject}</p>
                  <p className="text-xs text-slate-600 mt-1">{n.body}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">{n.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewResumeUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Resume Preview</h3>
              <button onClick={() => setViewResumeUrl(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 bg-slate-100 p-4">
              <iframe src={viewResumeUrl} className="w-full h-full rounded-2xl border border-slate-200 bg-white" title="Resume Preview" />
            </div>
          </div>
        </div>
      )}

      {selectedJobForApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold mb-4">Submit Application</h3>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="text-xs" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedJobForApp(null)} className="px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold mb-4">Post New Opening</h3>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="Job Title" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
              <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="Location" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
              <input type="text" required value={newJob.stipend} onChange={(e) => setNewJob({...newJob, stipend: e.target.value})} placeholder="Stipend" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
              <textarea rows="3" required value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Description" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPostJobOpen(false)} className="px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}