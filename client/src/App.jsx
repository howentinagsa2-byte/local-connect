import React, { useState } from 'react';
import { 
  Search, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('student');
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');

  const jobListings = [
    {
      id: 1,
      title: "Junior Software Engineer (OJT)",
      company: "TechSolutions Inc.",
      location: "San Mateo, Rizal",
      type: "OJT / Internship",
      mode: "On-site",
      stipend: "PHP 500 / day",
      description: "Seeking motivated IT students for full-stack web development internship using React and Node.js.",
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Administrative Assistant OJT",
      company: "Metro Health Center",
      location: "Marikina City",
      type: "OJT / Internship",
      mode: "Hybrid",
      stipend: "PHP 400 / day",
      description: "Assist municipal health records management, document processing, and patient coordination.",
      posted: "1 day ago"
    },
    {
      id: 3,
      title: "Data Entry Analyst",
      company: "Global Logistics Corp",
      location: "Antipolo City",
      type: "Full-time Job",
      mode: "Remote",
      stipend: "PHP 18,000 / month",
      description: "Manage local transport schedules, route optimization logs, and database entry updates.",
      posted: "Just now"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">Local Connect</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Local Job & OJT Placement Portal</p>
              </div>
            </div>

            {/* Role Selector Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200/60">
              <button
                onClick={() => setActiveRole('student')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student / Job Seeker</span>
              </button>

              <button
                onClick={() => setActiveRole('employer')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'employer'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Employer</span>
              </button>

              <button
                onClick={() => setActiveRole('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Placement Admin</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Find Your Next OJT or Career Opportunity
            </h2>
            <p className="mt-2 text-blue-100 text-sm">
              Discover verified local internships and entry-level positions tailored for IT students.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search openings by title, skill, or company..."
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl shadow-sm border-0 focus:ring-2 focus:ring-blue-300 text-sm placeholder:text-slate-400"
              />
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-md">
              Search Jobs
            </button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                Student Navigation
              </h3>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'browse'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4" />
                    <span>Browse Jobs & OJTs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'applications'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4" />
                    <span>My Applications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </nav>
            </div>
          </aside>

          {/* Job Listings Feed */}
          <section className="lg:col-span-3 space-y-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                Featured Opportunities ({jobListings.length})
              </h3>
              <span className="text-xs text-slate-500">Sorted by most recent</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobListings.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                        {job.type}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.posted}
                      </span>
                    </div>

                    {/* Job Title & Company */}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 mb-3">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location} ({job.mode})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xs text-slate-400 block">Stipend / Salary</span>
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.stipend}
                      </span>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm">
                      Apply Now
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  LogOut, 
  FileText, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Demo Authentication Switch
    if (email === 'student@icct.edu.ph' && password === 'password123') {
      setCurrentUser({ name: 'Owen', role: 'student', email });
    } else if (email === 'hr@techsolutions.com' && password === 'password123') {
      setCurrentUser({ name: 'TechSolutions HR', role: 'employer', email });
    } else if (email === 'admin@localconnect.gov.ph' && password === 'password123') {
      setCurrentUser({ name: 'Placement Coordinator', role: 'admin', email });
    } else {
      setLoginError('Invalid credentials. Use demo accounts listed below.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (Logged Out State)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8">
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-none">Local Connect</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">CapStone Portal Sign In</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@icct.edu.ph"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm mt-2"
            >
              Sign In to Portal
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-bold text-slate-700 mb-2">Quick Demo Accounts (Password: password123):</p>
            <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono text-[11px]">
              <li><strong className="text-blue-600">Student:</strong> student@icct.edu.ph</li>
              <li><strong className="text-emerald-600">Employer:</strong> hr@techsolutions.com</li>
              <li><strong className="text-purple-600">Admin:</strong> admin@localconnect.gov.ph</li>
            </ul>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN WRAPPER (Top Bar & Logout)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Universal Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
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
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------
          2. STUDENT DASHBOARD UI
      --------------------------------------------------------- */}
      {currentUser.role === 'student' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-600 rounded-3xl p-8 text-white mb-8 shadow-lg shadow-blue-500/10">
            <h2 className="text-2xl font-bold">Welcome back, {currentUser.name}!</h2>
            <p className="text-blue-100 text-sm mt-1">Explore verified local OJT internships and job placements.</p>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" /> Available OJT & Job Openings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">OJT / Internship</span>
              <h4 className="text-base font-bold mt-3">Junior Software Engineer (OJT)</h4>
              <p className="text-xs text-slate-500 mt-1">TechSolutions Inc. • San Mateo, Rizal</p>
              <p className="text-xs text-slate-600 mt-3">Full-stack React & Node.js development internship opportunity for IT students.</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600">PHP 500 / day</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold">Apply Now</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">OJT / Internship</span>
              <h4 className="text-base font-bold mt-3">Administrative Assistant OJT</h4>
              <p className="text-xs text-slate-500 mt-1">Metro Health Center • Marikina City</p>
              <p className="text-xs text-slate-600 mt-3">Assist with health records management, patient logs, and data processing.</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600">PHP 400 / day</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold">Apply Now</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ---------------------------------------------------------
          3. EMPLOYER DASHBOARD UI
      --------------------------------------------------------- */}
      {currentUser.role === 'employer' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Employer Recruitment Hub</h2>
              <p className="text-xs text-slate-500">Manage company OJT postings and review student applicants.</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Post New OJT Opening</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Active Postings & Applicants</h3>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">2 Active Listings</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Junior Software Engineer (OJT)</h4>
                  <p className="text-xs text-slate-500">Posted 2 days ago • 14 Applicants</p>
                </div>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Review Applicants</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ---------------------------------------------------------
          4. ADMIN DASHBOARD UI
      --------------------------------------------------------- */}
      {currentUser.role === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Placement Coordinator Admin Portal</h2>
            <p className="text-xs text-slate-500">Monitor student OJT hours, placement verifications, and partner companies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Placed Students</p>
                <h4 className="text-xl font-black text-slate-900">128</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Building2 className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Partner Companies</p>
                <h4 className="text-xl font-black text-slate-900">34</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Pending Verifications</p>
                <h4 className="text-xl font-black text-slate-900">5</h4>
              </div>
            </div>
          </div>
        </main>
      )}

    </div>
  );
}