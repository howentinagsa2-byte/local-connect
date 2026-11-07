// src/App.jsx - Complete Full-Stack Frontend with Resume Viewer & Preset Hours Selection (243, 400, 600)
import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, ShieldCheck, Search, PlusCircle, LogOut, FileText, Users, MapPin, Clock, DollarSign, ChevronRight, CheckCircle, X, Upload, Filter, Check, AlertCircle, Trash2, Eye, EyeOff, Download, Mail, Bell, Settings, Award, UserPlus, User, Plus, Minus } from 'lucide-react';

const API_BASE = "https://local-connect-api-t9jx.onrender.com";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('local_connect_user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('local_connect_token') || '');
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'));

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('student');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

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
  
  // Job Editing States
  const [editingJob, setEditingJob] = useState(null);
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  
  // Resume Modal Preview State for Employers
  const [viewingResumeUrl, setViewingResumeUrl] = useState(null);
  
  const [hoursInput, setHoursInput] = useState('');
  
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
            if (rememberMe) localStorage.setItem('remembered_email', email);
            else localStorage.removeItem('remembered_email');
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

  const handleModifyHours = async (isAdd, specificVal = null) => {
    const val = specificVal !== null ? specificVal : parseInt(hoursInput);
    if (!val || val <= 0) {
      alert('Please enter or select a valid number of hours.');
      return;
    }
    try {
      const payload = isAdd ? { hoursToAdd: val } : { hoursToRemove: val };
      const res = await fetch(`${API_BASE}/api/student/hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...currentUser, completedHours: data.completedHours };
        setCurrentUser(updatedUser);
        localStorage.setItem('local_connect_user', JSON.stringify(updatedUser));
        setHoursInput('');
      }
    } catch (err) {
      alert('Failed to update hours.');
    }
  };

  const handleSetTargetHours = async (targetVal) => {
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
    } catch (err) {
      alert('Failed to set target hours.');
    }
  };

  const handleCancelCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to cancel and remove this partnership?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        alert('Partnership cancelled successfully.');
        fetchAdminCompanies();
      }
    } catch (err) {
      alert('Failed to cancel partnership.');
    }
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

  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingJob)
      });
      if (res.ok) {
        alert('Job listing updated successfully!');
        setIsEditJobOpen(false);
        setEditingJob(null);
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update job listing.');
      }
    } catch (err) {
      alert('Network error updating job listing.');
    }
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

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || j.category === selectedCategory;
    const matchesType = selectedType === 'All' || j.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8">
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
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. student@icct.edu.ph" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
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
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. admin@localnet.ph" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. hr@company.com" className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-10 bg-slate-950/80 rounded-xl border border-slate-800 focus:border-blue-500 text-sm outline-none text-slate-100" />
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

          <div className="mt-4 text-center">
            {authMode === 'login' && <button onClick={() => { setAuthMode('forgot'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-blue-400 hover:underline">Forgot password?</button>}
            {authMode !== 'login' && authMode !== 'partner' && <button onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-slate-400 hover:text-white">Back to Sign In</button>}
            {authMode === 'partner' && <button onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }} className="text-xs text-slate-400 hover:text-white">Already approved? Sign In</button>}
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
              <span className="text-[11px] font-semibold text-slate-400 capitalize">{currentUser.role} Workspace ({currentUser.email})</span>
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

      {isNotificationsOpen && (
        <div className="absolute right-4 top-20 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 z-50 p-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Notifications ({currentUser.email})</h4>
            <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No notifications.</p>
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
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsProfileOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'student' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Internship Progress</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-black text-white">{currentUser.completedHours || 0} <span className="text-xs font-normal text-slate-400">/ {currentUser.totalRequiredHours || 500} hrs</span></span>
                  <span className="text-xs font-bold text-blue-400">{Math.round(((currentUser.completedHours || 0) / (currentUser.totalRequiredHours || 500)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, ((currentUser.completedHours || 0) / (currentUser.totalRequiredHours || 500)) * 100)}%` }}></div>
                </div>

                {/* Preset Required Hours Selectors (243, 400, 600) */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="block text-[11px] font-bold text-slate-400 mb-1.5">Required Hours Goal:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button onClick={() => handleSetTargetHours(243)} className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${currentUser.totalRequiredHours === 243 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>243 hrs</button>
                    <button onClick={() => handleSetTargetHours(400)} className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${currentUser.totalRequiredHours === 400 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>400 hrs</button>
                    <button onClick={() => handleSetTargetHours(600)} className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${currentUser.totalRequiredHours === 600 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>600 hrs</button>
                  </div>
                </div>

                {/* Quick Add / Remove hours */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <input type="number" min="1" placeholder="Hours" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} className="w-20 px-2.5 py-1.5 bg-slate-950 rounded-xl text-xs border border-slate-800 text-white outline-none focus:border-blue-500" />
                  <button onClick={() => handleModifyHours(true)} className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                  <button onClick={() => handleModifyHours(false)} className="flex-1 py-1.5 px-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md">
                    <Minus className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Active Applications</span>
                  <span className="block text-2xl font-black text-white mt-2">{applications.length}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">Track status updates in real-time</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-bold text-slate-200">Connected & Persistent</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">ICCT Colleges Capstone Platform</span>
              </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-800 pb-3">
              <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'browse' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Browse OJT Listings</button>
              <button onClick={() => setActiveTab('my-apps')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'my-apps' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>My Applications ({applications.length})</button>
            </div>

            {activeTab === 'browse' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by job title, company, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500" />
                  </div>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 outline-none">
                    <option value="All">All Categories</option>
                    <option value="IT / Web Dev">IT / Web Dev</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 text-xs">No matching OJT listings found. Please ask your admin to post positions.</div>
                  ) : (
                    filteredJobs.map(job => (
                      <div key={job.id} className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-900">{job.category}</span>
                            <span className="text-[11px] text-slate-400">{job.posted}</span>
                          </div>
                          <h3 className="text-base font-bold text-white mb-1">{job.title}</h3>
                          <p className="text-xs font-semibold text-slate-300 mb-3">{job.companyName}</p>
                          <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"><MapPin className="w-3 h-3 text-slate-500" />{job.location}</span>
                            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"><Clock className="w-3 h-3 text-slate-500" />{job.type}</span>
                            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"><DollarSign className="w-3 h-3 text-slate-500" />{job.stipend}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4">{job.description}</p>
                        </div>
                        <button onClick={() => setSelectedJobForApp(job)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg">Apply for OJT Position</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'my-apps' && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Submitted Applications</div>
                <div className="divide-y divide-slate-800">
                  {applications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-500">You have not submitted any applications yet.</p>
                  ) : (
                    applications.map(app => (
                      <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white">{app.jobTitle}</h4>
                          <p className="text-xs text-slate-400">{app.companyName} • Applied on {app.appliedDate}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${app.status === 'Interview Scheduled' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-blue-950 text-blue-400 border border-blue-900'}`}>{app.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'employer' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{currentUser.name} Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1">Showing only the students who applied to {currentUser.name} ({currentUser.email}).</p>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-bold rounded-full">Partner Verified</span>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Applicants for {currentUser.name} ({applications.length})</div>
              <div className="divide-y divide-slate-800">
                {applications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-500">No student applications received for your company yet.</p>
                ) : (
                  applications.map(app => (
                    <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-white">{app.studentName} <span className="text-xs font-normal text-slate-400">({app.studentEmail})</span></h4>
                        <p className="text-xs text-blue-400 mt-0.5">Applied for: {app.jobTitle}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* RESTORED VIEW RESUME BUTTON */}
                        <button onClick={() => setViewingResumeUrl(`${API_BASE}${app.resumeUrl}`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                          <FileText className="w-3.5 h-3.5 text-blue-400" /> View Resume
                        </button>
                        <select value={app.status} onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)} className="px-3 py-1.5 bg-slate-950 rounded-xl text-xs text-slate-200 border border-slate-800 outline-none">
                          <option value="Under Review">Under Review</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Placement Coordinator Control Center</h3>
                <p className="text-xs text-slate-400 mt-1">Manage partner companies, publish official OJT slots, and generate reports.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"><Download className="w-4 h-4" />Export CSV Report</button>
                <button onClick={() => setIsPostJobOpen(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"><PlusCircle className="w-4 h-4" />Post Official OJT Slot</button>
              </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-800 pb-3">
              <button onClick={() => setAdminTab('companies')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'companies' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Partner Companies ({companies.length})</button>
              <button onClick={() => setAdminTab('jobs')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminTab === 'jobs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Active Job Listings ({jobs.length})</button>
            </div>

            {adminTab === 'companies' && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Company Partnership Approvals</div>
                <div className="divide-y divide-slate-800">
                  {companies.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-500">No partner companies registered yet.</p>
                  ) : (
                    companies.map(c => (
                      <div key={c.id} className="p-5 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name}</h4>
                          <p className="text-xs text-slate-400">{c.industry} • {c.location} • {c.email}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${c.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'}`}>{c.status}</span>
                          {c.status !== 'Verified' && (
                            <button onClick={() => handleVerifyCompany(c.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer">Approve</button>
                          )}
                          <button onClick={() => handleCancelCompany(c.id)} className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {adminTab === 'jobs' && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Published OJT Positions</div>
                <div className="divide-y divide-slate-800">
                  {jobs.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-500">No active job listings. Click "Post Official OJT Slot" above to add one.</p>
                  ) : (
                    jobs.map(j => (
                      <div key={j.id} className="p-5 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{j.title}</h4>
                          <p className="text-xs text-slate-400">{j.companyName} • {j.location} • {j.stipend}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => { setEditingJob(j); setIsEditJobOpen(true); }} className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900 text-blue-400 rounded-xl border border-blue-900/50 text-xs font-bold transition-all">Edit</button>
                          <button onClick={() => handleDeleteJob(j.id)} className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-xl border border-red-900/50 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* View Resume Modal for Employers */}
      {viewingResumeUrl && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Student Resume Preview</h3>
              <button onClick={() => setViewingResumeUrl(null)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <iframe src={viewingResumeUrl} className="w-full h-full" title="Resume PDF Preview"></iframe>
            </div>
            <div className="flex justify-end pt-4">
              <a href={viewingResumeUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                <Download className="w-4 h-4" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {selectedJobForApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Apply for {selectedJobForApp.title}</h3>
              <button onClick={() => setSelectedJobForApp(null)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Upload Resume (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setSelectedJobForApp(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPostJobOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Post Official OJT Listing (Admin)</h3>
              <button onClick={() => setIsPostJobOpen(false)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Title</label>
                <input type="text" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Junior Web Developer" className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Partner Company Name</label>
                <input type="text" required value={newJob.companyName} onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })} placeholder="e.g. TechSolutions Inc." className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select value={newJob.category} onChange={(e) => setNewJob({ ...newJob, category: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none">
                    <option value="IT / Web Dev">IT / Web Dev</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                  <input type="text" required value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Stipend / Allowance</label>
                <input type="text" required value={newJob.stipend} onChange={(e) => setNewJob({ ...newJob, stipend: e.target.value })} placeholder="e.g. PHP 500 / day" className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Description</label>
                <textarea required rows="3" value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="Detailed intern responsibilities..." className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500 resize-none"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsPostJobOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg">Publish OJT Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditJobOpen && editingJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Edit OJT Listing</h3>
              <button onClick={() => { setIsEditJobOpen(false); setEditingJob(null); }} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Title</label>
                <input type="text" required value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Partner Company Name</label>
                <input type="text" required value={editingJob.companyName} onChange={(e) => setEditingJob({ ...editingJob, companyName: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select value={editingJob.category} onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none">
                    <option value="IT / Web Dev">IT / Web Dev</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                  <input type="text" required value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Stipend / Allowance</label>
                <input type="text" required value={editingJob.stipend} onChange={(e) => setEditingJob({ ...editingJob, stipend: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Job Description</label>
                <textarea required rows="3" value={editingJob.description} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} className="w-full px-4 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-100 border border-slate-800 outline-none focus:border-blue-500 resize-none"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => { setIsEditJobOpen(false); setEditingJob(null); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}