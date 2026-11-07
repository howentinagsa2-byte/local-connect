import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, ShieldCheck, Search, PlusCircle, LogOut, FileText, Users, MapPin, Clock, DollarSign, ChevronRight, CheckCircle, X, Upload, Filter, Check, AlertCircle } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJobForApp, setSelectedJobForApp] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [newJob, setNewJob] = useState({ title: '', companyName: '', category: 'IT / Web Dev', type: 'OJT / Internship', mode: 'On-site', location: '', stipend: '', description: '' });

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === 'student') fetchStudentApplications();
      if (currentUser.role === 'employer') fetchEmployerApplications();
      if (currentUser.role === 'admin') fetchAdminCompanies();
    }
  }, [currentUser, token]);

  const fetchJobs = async () => {
    try { const res = await fetch(`${API_BASE}/api/jobs`); if (res.ok) setJobs(await res.json()); } catch (err) {}
  };
  const fetchStudentApplications = async () => {
    try { const res = await fetch(`${API_BASE}/api/applications/student`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {}
  };
  const fetchEmployerApplications = async () => {
    try { const res = await fetch(`${API_BASE}/api/applications/employer`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {}
  };
  const fetchAdminCompanies = async () => {
    try { const res = await fetch(`${API_BASE}/api/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setCompanies(await res.json()); } catch (err) {}
  };

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
      if (res.ok) { alert('Application submitted!'); setSelectedJobForApp(null); setResumeFile(null); fetchStudentApplications(); }
    } catch (err) { alert('Failed to submit.'); }
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
    } catch (err) { alert('Failed to post.'); }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchEmployerApplications();
    } catch (err) {}
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}/verify`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchAdminCompanies();
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
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search openings by title, skill, or location..." className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl shadow-sm border-0 focus:ring-2 focus:ring-blue-300 text-sm placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          {/* OJT Hours Progress Tracker Card */}
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
                  style={{ width: `${((currentUser.completedHours || 120) / (currentUser.totalRequiredHours || 500)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const hours = prompt("Enter hours to add (e.g., 8):", "8");
                if (!hours) return;
                try {
                  const res = await fetch(`${API_BASE}/api/student/hours`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ hoursToAdd: hours })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    const updatedUser = { ...currentUser, completedHours: data.completedHours };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('local_connect_user', JSON.stringify(updatedUser));
                    alert('Hours updated successfully!');
                  }
                } catch (err) {
                  alert('Failed to update hours.');
                }
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
                  <button onClick={() => setActiveTab('browse')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}><div className="flex items-center space-x-3"><Search className="w-4 h-4" /><span>Browse Jobs & OJTs</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                  <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}><div className="flex items-center space-x-3"><FileText className="w-4 h-4" /><span>My Applications ({applications.length})</span></div><ChevronRight className="w-4 h-4 opacity-50" /></button>
                </nav>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Filters</h3>
                <div className="space-y-3 px-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none">
                      <option value="All">All Categories</option>
                      <option value="IT / Web Dev">IT / Web Dev</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none">
                      <option value="All">All Types</option>
                      <option value="OJT / Internship">OJT / Internship</option>
                      <option value="Full-time Job">Full-time Job</option>
                    </select>
                  </div>
                </div>
              </div>
            </aside>
            <section className="lg:col-span-3">
              {activeTab === 'browse' ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Featured Opportunities ({filteredJobs.length})</h3>
                    <span className="text-xs text-slate-500">Sorted by most recent</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">{job.type}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {job.posted}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 mb-3">
                            <span className="font-semibold text-slate-700">{job.companyName}</span><span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location} ({job.mode})</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5" /> {job.stipend}</span>
                          <button onClick={() => setSelectedJobForApp(job)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors">Apply Now</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">My Submitted Applications</h3>
                  {applications.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center">No applications submitted yet.</p> : (
                    <div className="divide-y divide-slate-100">
                      {applications.map(app => (
                        <div key={app.id} className="py-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{app.companyName} • Applied on {app.appliedDate}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'Hired' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{app.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {currentUser.role === 'employer' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Employer Recruitment Hub</h2>
              <p className="text-xs text-slate-500 mt-1">Manage company OJT postings and review student applicants.</p>
            </div>
            <button onClick={() => setIsPostJobOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-colors"><PlusCircle className="w-4 h-4" /><span>Post New OJT Opening</span></button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Active Candidate Applications</h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-semibold">{applications.length} Total Applicants</span>
            </div>
            <div className="divide-y divide-slate-100">
              {applications.map(appItem => (
                <div key={appItem.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-blue-600 font-semibold">{appItem.jobTitle}</span>
                    <h4 className="font-bold text-slate-900 text-base">{appItem.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Email: {appItem.studentEmail} • Submitted {appItem.appliedDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700 mr-2">{appItem.status}</span>
                    <button onClick={() => handleUpdateAppStatus(appItem.id, 'Interview Scheduled')} className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition-colors">Interview</button>
                    <button onClick={() => handleUpdateAppStatus(appItem.id, 'Hired')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">Hire OJT</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentUser.role === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Placement Coordinator Admin Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Monitor student OJT hours, placement verifications, and partner companies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-bold uppercase">Placed Students</p><h4 className="text-xl font-black text-slate-900">129</h4></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Building2 className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-bold uppercase">Partner Companies</p><h4 className="text-xl font-black text-slate-900">{companies.length}</h4></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4"><div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-bold uppercase">Pending Review</p><h4 className="text-xl font-black text-slate-900">{companies.filter(c => c.status !== 'Verified').length}</h4></div></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4"><div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 font-bold uppercase">Placement Rate</p><h4 className="text-xl font-black text-slate-900">92%</h4></div></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Employer Verification Queue</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">{companies.length} Registered</span>
            </div>
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
                  {company.status !== 'Verified' && <button onClick={() => handleVerifyCompany(company.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shadow-sm transition-colors"><Check className="w-3.5 h-3.5" /><span>Approve Verification</span></button>}
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {selectedJobForApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Submit Application</h3>
              <button onClick={() => setSelectedJobForApp(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Applying for <strong className="text-slate-800">{selectedJobForApp.title}</strong> at {selectedJobForApp.companyName}</p>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Resume (PDF)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="text-xs text-slate-500" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setSelectedJobForApp(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20">Submit Resume</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Post New Opening</h3>
              <button onClick={() => setIsPostJobOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Job Title</label>
                <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Junior Web Developer OJT" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={newJob.category} onChange={(e) => setNewJob({...newJob, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                    <option value="IT / Web Dev">IT / Web Dev</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
                  <select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                    <option value="OJT / Internship">OJT / Internship</option>
                    <option value="Full-time Job">Full-time Job</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                  <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. San Mateo, Rizal" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stipend / Salary</label>
                  <input type="text" required value={newJob.stipend} onChange={(e) => setNewJob({...newJob, stipend: e.target.value})} placeholder="e.g. PHP 500 / day" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows="3" required value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Describe internship requirements and responsibilities..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsPostJobOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md">Publish Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}