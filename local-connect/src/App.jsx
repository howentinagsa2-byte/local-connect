// src/App.jsx - Complete Full-Stack Frontend (Local Connect Capstone)
import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, ShieldCheck, Search, PlusCircle, LogOut, FileText, Users, MapPin, Clock, DollarSign, ChevronRight, CheckCircle, X, Upload, Filter, Check, AlertCircle, Trash2, Eye, EyeOff, Download, Mail, Bell, Settings, Award, UserPlus, User } from 'lucide-react';

const API_BASE = "https://local-connect-api-t9jx.onrender.com";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('local_connect_user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('local_connect_token') || '');
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'partner', 'forgot'
  const [name, setName] = useState('');
  
  // Remember Me state initialization
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'));

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('student');
  
  // Show/Hide Password states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  // Partner application fields
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPassword, setCompPassword] = useState('');

  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
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
  
  // New Job form state for Admin Panel
  const [newJob, setNewJob] = useState({
    title: '',
    companyName: '',
    category: 'IT / Web Dev',
    type: 'OJT / Internship',
    mode: 'On-site',
    location: 'San Mateo, Rizal',
    stipend: 'PHP 500 / day',
    description: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('companies');

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === 'student') fetchStudentApplications();
      if (currentUser.role === 'employer') fetchEmployerApplications();
      if (currentUser.role === 'admin') fetchAdminCompanies();
      fetchNotifications();
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
    }
  }, [currentUser, token]);

  const fetchJobs = async () => { try { const res = await fetch(`${API_BASE}/api/jobs`); if (res.ok) setJobs(await res.json()); } catch (err) {} };
  const fetchStudentApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/student`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchEmployerApplications = async () => { try { const res = await fetch(`${API_BASE}/api/applications/employer`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setApplications(await res.json()); } catch (err) {} };
  const fetchAdminCompanies = async () => { try { const res = await fetch(`${API_BASE}/api/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setCompanies(await res.json()); } catch (err) {} };
  const fetchNotifications = async () => { try { const res = await fetch(`${API_BASE}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) setNotifications(await res.json()); } catch (err) {} };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsSubmitting(true);

    try {
      if (authMode === 'forgot') {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setLoginSuccess(data.message);
          setAuthMode('login');
          setPassword('');
        } else {
          setLoginError(data.error || 'Password reset failed.');
        }
      } else if (authMode === 'partner') {
        const res = await fetch(`${API_BASE}/api/auth/partner-apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: compName, industry: compIndustry, location: compLocation, email: compEmail, password: compPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setLoginSuccess(data.message);
          setAuthMode('login');
          setCompName(''); setCompIndustry(''); setCompLocation(''); setCompEmail(''); setCompPassword('');
        } else {
          setLoginError(data.error || 'Partnership submission failed.');
        }
      } else {
        const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const payload = authMode === 'login' ? { email, password } : { name, email, password, role };

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          if (authMode === 'login') {
            if (rememberMe) {
              localStorage.setItem('remembered_email', email);
            } else {
              localStorage.removeItem('remembered_email');
            }
          }
          setCurrentUser(data.user);
          setToken(data.token);
          localStorage.setItem('local_connect_user', JSON.stringify(data.user));
          localStorage.setItem('local_connect_token', data.token);
        } else {
          setLoginError(data.error || 'Authentication failed.');
        }
      }
    } catch (err) {
      setLoginError('Could not connect to backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: profileName, email: profileEmail, newPassword: profilePassword || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('local_connect_user', JSON.stringify(data.user));
        localStorage.setItem('local_connect_token', data.token);
        setProfilePassword('');
        setProfileMessage('Profile updated successfully!');
      } else {
        setProfileMessage(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileMessage('Network error updating profile.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('local_connect_user');
    localStorage.removeItem('local_connect_token');
    setPassword('');
    setName('');
    if (!rememberMe) setEmail('');
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
              <p className="text-xs text-slate-400 font-medium mt-1">CapStone Portal</p>
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
              <button onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }} className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Sign In</button>
              <button onClick={() => { setAuthMode('register'); setLoginError(''); setLoginSuccess(''); }} className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${authMode === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Student Signup</button>
              <button onClick={() => { setAuthMode('partner'); setLoginError(''); setLoginSuccess(''); }} className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${authMode === 'partner' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Partner With Us</button>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="mb-4 text-center">
              <h3 className="text-sm font-bold text-white">Reset Your Password</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your registered email and choose a new password.</p>
            </div>
          )}

          {authMode === 'partner' && (
            <div className="mb-4 text-center">
              <h3 className="text-sm font-bold text-emerald-400">Company Partnership Application</h3>
              <p className="text-xs text-slate-400 mt-1">Submit your company details for admin review and approval.</p>
            </div>
          )}

          {loginError && <div className="mb-4 p-3 bg-red-950/60 text-red-400 rounded-xl text-xs font-semibold border border-red-900/50 text-center flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /><span>{loginError}</span></div>}
          {loginSuccess && <div className="mb-4 p-3 bg-emerald-950/60 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-900/50 text-center flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /><span>{loginSuccess}</span></div>}
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. student@icct.edu.ph" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {authMode === 'partner' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input type="text" required value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Tech Corp" className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-emerald-500 text-xs outline-none text-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Industry</label>
                    <input type="text" required value={compIndustry} onChange={(e) => setCompIndustry(e.target.value)} placeholder="e.g. IT / Logistics" className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-emerald-500 text-xs outline-none text-slate-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                    <input type="text" required value={compLocation} onChange={(e) => setCompLocation(e.target.value)} placeholder="e.g. Marikina" className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-emerald-500 text-xs outline-none text-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">HR Contact Email</label>
                  <input type="email" required value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="e.g. hr@techcorp.com" className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-emerald-500 text-xs outline-none text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={compPassword} onChange={(e) => setCompPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-emerald-500 text-xs outline-none text-slate-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {authMode === 'login' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. admin@localnet.ph" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer" />
                    <span>Remember Me</span>
                  </label>
                </div>
              </>
            )}

            {authMode === 'forgot' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. hr@company.com" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100 transition-all" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg text-sm mt-2 disabled:opacity-50 ${authMode === 'partner' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25'}`}>
              {isSubmitting ? 'Processing...' : (authMode === 'login' ? 'Sign In to Portal' : authMode === 'register' ? 'Register Student Account' : authMode === 'partner' ? 'Submit Partnership Application' : 'Reset Password')}
            </button>
          </form>

          {/* Forgot Password / Switch Links */}
          <div className="mt-4 text-center">
            {authMode === 'login' && (
              <button onClick={() => { setAuthMode('forgot'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-blue-400 hover:underline">Forgot password?</button>
            )}
            {authMode !== 'login' && authMode !== 'partner' && (
              <button onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-slate-400 hover:text-white">Back to Sign In</button>
            )}
            {authMode === 'partner' && (
              <button onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-slate-400 hover:text-white">Already approved? Sign In</button>
            )}
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
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">{unreadCount}</span>}
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{currentUser.name}</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"><LogOut className="w-3.5 h-3.5" /><span>Logout</span></button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
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

      {/* User Profile Settings Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Account Settings & Profile</h3>
              <button onClick={() => setIsProfileOpen(false)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            {profileMessage && <div className={`mb-4 p-3 rounded-xl text-xs font-semibold text-center ${profileMessage.includes('success') ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' : 'bg-red-950/60 text-red-400 border border-red-900'}`}>{profileMessage}</div>}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Full Name / Entity Name</label>
                <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                <input type="email" required value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input type={showProfilePassword ? "text" : "password"} value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 pr-10 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                  <button type="button" onClick={() => setShowProfilePassword(!showProfilePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Workspace Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'student' && (
          <div className="space-y-6">
            {/* OJT Progress Tracker Banner */}
            <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-900/40 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">OJT Hours Tracker</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Track your completed internship hours toward graduation requirements.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Target Hours:</span>
                  <select 
                    value={currentUser.totalRequiredHours || 500} 
                    onChange={(e) => updateTargetHours(e.target.value)}
                    className="bg-slate-950 text-blue-400 font-bold text-xs rounded-xl px-2 py-1 border border-slate-800 outline-none"
                  >
                    <option value="243">243 Hours</option>
                    <option value="400">400 Hours</option>
                    <option value="500">500 Hours</option>
                    <option value="600">600 Hours</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar Calculation */}
              <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentUser.completedHours || 0) / (currentUser.totalRequiredHours || 500)) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs font-semibold text-slate-300">
                <span>Completed: <strong className="text-blue-400">{currentUser.completedHours || 0} hrs</strong></span>
                <span>Remaining: <strong className="text-indigo-400">{Math.max(0, (currentUser.totalRequiredHours || 500) - (currentUser.completedHours || 0))} hrs</strong></span>
                <span>Target: <strong className="text-white">{currentUser.totalRequiredHours || 500} hrs</strong></span>
              </div>
            </div>

            {/* Student Navigation Tabs */}
            <div className="flex space-x-2 border-b border-slate-800 pb-2">
              <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'browse' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Browse OJT Listings</button>
              <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>My Applications ({applications.length})</button>
            </div>

            {activeTab === 'browse' && (
              <>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search OJT postings by title, company, or location..." className="w-full pl-11 pr-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
                  </div>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 outline-none">
                    <option value="All">All Categories</option>
                    <option value="IT / Web Dev">IT / Web Dev</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 outline-none">
                    <option value="All">All Types</option>
                    <option value="OJT / Internship">OJT / Internship</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-500 text-xs">No OJT listings match your search criteria.</div>
                  ) : (
                    filteredJobs.map(job => (
                      <div key={job.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-900/50">{job.category}</span>
                            <span className="text-xs text-slate-500">{job.posted}</span>
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">{job.title}</h4>
                          <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-400" /><span>{job.companyName}</span></p>
                          <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-slate-300">
                            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" />{job.location}</span>
                            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{job.type} ({job.mode})</span>
                            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" />{job.stipend}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                        </div>
                        <button onClick={() => setSelectedJobForApp(job)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all">Apply for OJT Position</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">My Submitted Applications</h3>
                {applications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">You haven't applied to any OJT listings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">{app.jobTitle}</h4>
                          <p className="text-xs text-slate-400">{app.companyName} • Applied on {app.appliedDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${app.status === 'Interview Scheduled' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-amber-950 text-amber-400 border-amber-900'}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'employer' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Partner Employer Dashboard</h3>
                  <p className="text-xs text-slate-400">Review student applicants and manage OJT placement pipelines.</p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Incoming Student Applications</h4>
              {applications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No applications received yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-white">{app.studentName}</h5>
                        <p className="text-xs text-slate-400">{app.studentEmail} • Applied for <strong className="text-blue-400">{app.jobTitle}</strong></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={app.status} 
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-900 text-xs text-slate-200 rounded-xl border border-slate-800 outline-none"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Admin Control Panel</h3>
                <p className="text-xs text-slate-400">Manage partner company approvals, system job listings, and placement reports.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsPostJobOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25">
                  <PlusCircle className="w-4 h-4" /><span>Post Official Job</span>
                </button>
                <button onClick={handleExportCSV} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700">
                  <Download className="w-4 h-4" /><span>Export CSV Report</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-800 pb-2">
              <button onClick={() => setAdminTab('companies')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'companies' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Partner Applications ({companies.length})</button>
              <button onClick={() => setAdminTab('jobs')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'jobs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Manage Job Listings ({jobs.length})</button>
            </div>

            {adminTab === 'companies' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4">Partner Company Verification Queue</h4>
                {companies.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No partner applications submitted.</p>
                ) : (
                  <div className="space-y-3">
                    {companies.map(c => (
                      <div key={c.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <h5 className="text-sm font-bold text-white">{c.name}</h5>
                          <p className="text-xs text-slate-400">{c.industry} • {c.location} • {c.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${c.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-amber-950 text-amber-400 border-amber-900'}`}>
                            {c.status}
                          </span>
                          {c.status !== 'Verified' && (
                            <button onClick={() => handleVerifyCompany(c.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">Verify & Approve</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {adminTab === 'jobs' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4">Active System Job Listings</h4>
                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No job listings found.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map(j => (
                      <div key={j.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <h5 className="text-sm font-bold text-white">{j.title}</h5>
                          <p className="text-xs text-slate-400">{j.companyName} • {j.location} • {j.type}</p>
                        </div>
                        <button onClick={() => handleDeleteJob(j.id)} className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Application Modal */}
      {selectedJobForApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Apply for {selectedJobForApp.title}</h3>
              <button onClick={() => setSelectedJobForApp(null)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Company: <strong className="text-slate-200">{selectedJobForApp.companyName}</strong></p>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Upload Resume / CV (PDF)</label>
                <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Post Job Modal */}
      {isPostJobOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Post New Job Listing</h3>
              <button onClick={() => setIsPostJobOpen(false)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Title</label>
                <input type="text" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Junior Web Developer" className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Company Name</label>
                <input type="text" required value={newJob.companyName} onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })} placeholder="e.g. TechSolutions Inc." className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <input type="text" required value={newJob.category} onChange={(e) => setNewJob({ ...newJob, category: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Type</label>
                  <input type="text" required value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                  <input type="text" required value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Stipend</label>
                  <input type="text" required value={newJob.stipend} onChange={(e) => setNewJob({ ...newJob, stipend: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                <textarea required rows={4} value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="Enter job description..." className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25">Publish Job Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}