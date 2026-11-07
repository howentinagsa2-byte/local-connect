import React, { useState } from 'react';

export default function App() {
  const [activeRole, setActiveRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [jobs, setJobs] = useState([
    { id: 1, companyName: 'TechSolutions Inc.', title: 'Junior Software Engineer (OJT)', type: 'OJT / Internship', category: 'Information Technology', location: 'On-site', description: 'Seeking motivated IT students for full-stack web development internship using React and Node.js.', deadline: '2026-10-30', stipend: 'PHP 500 / day' },
    { id: 2, companyName: 'Metro Health Center', title: 'Administrative Assistant OJT', type: 'OJT / Internship', category: 'Administration', location: 'Hybrid', description: 'Assist municipal health records and patient coordination.', deadline: '2026-11-05', stipend: 'PHP 400 / day' },
    { id: 3, companyName: 'Global Logistics Corp', title: 'Data Entry Analyst', type: 'Full-time Job', category: 'Operations', location: 'Remote', description: 'Process shipping manifests and maintain digital database accuracy.', deadline: '2026-11-20', stipend: 'PHP 25,000 / month' }
  ]);

  const [applications, setApplications] = useState([
    { id: 1, jobId: 1, jobTitle: 'Junior Software Engineer (OJT)', companyName: 'TechSolutions Inc.', status: 'Interview Scheduled', appliedAt: '2026-09-15' }
  ]);

  const [companies, setCompanies] = useState([
    { id: 1, name: 'TechSolutions Inc.', industry: 'Information Technology', status: 'Verified' },
    { id: 2, name: 'Apex Engineering Works', industry: 'Engineering', status: 'Pending Approval' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleApply = (job) => {
    const newApp = {
      id: applications.length + 1,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      status: 'Submitted',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    setApplications([newApp, ...applications]);
    showToast(`Successfully applied to ${job.companyName} for ${job.title}!`);
  };

  const verifyCompany = (id) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Verified' } : c));
    showToast('Company profile verified and posting privileges granted.');
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b', margin: 0 }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#059669', color: 'white', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, fontWeight: 'bold' }}>
          ✓ {toast}
        </div>
      )}

      {/* Header & Role Switcher */}
      <header style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Local Connect</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Local Job & OJT/Internship Placement Portal[cite: 1]</p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => { setActiveRole('student'); setActiveTab('dashboard'); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: activeRole === 'student' ? '#2563eb' : 'transparent', color: 'white' }}>
            🎓 Student / Job Seeker[cite: 8]
          </button>
          <button 
            onClick={() => { setActiveRole('employer'); setActiveTab('listings'); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: activeRole === 'employer' ? '#2563eb' : 'transparent', color: 'white' }}>
            🏢 Employer[cite: 8]
          </button>
          <button 
            onClick={() => { setActiveRole('admin'); setActiveTab('admin-dash'); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: activeRole === 'admin' ? '#2563eb' : 'transparent', color: 'white' }}>
            🛡️ Placement Admin[cite: 8]
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Navigation Sidebar */}
        <aside style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>
            {activeRole === 'student' && 'Student Navigation'}
            {activeRole === 'employer' && 'Recruiter Workspace'}
            {activeRole === 'admin' && 'Admin Panel'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeRole === 'student' && (
              <>
                <button onClick={() => setActiveTab('dashboard')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'dashboard' ? '#eff6ff' : 'transparent', color: activeTab === 'dashboard' ? '#2563eb' : '#475569' }}>
                  🔍 Browse Jobs & OJTs[cite: 3]
                </button>
                <button onClick={() => setActiveTab('applications')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'applications' ? '#eff6ff' : 'transparent', color: activeTab === 'applications' ? '#2563eb' : '#475569' }}>
                  📄 My Applications[cite: 3]
                </button>
              </>
            )}

            {activeRole === 'employer' && (
              <>
                <button onClick={() => setActiveTab('listings')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'listings' ? '#eff6ff' : 'transparent', color: activeTab === 'listings' ? '#2563eb' : '#475569' }}>
                  💼 Manage Openings[cite: 4]
                </button>
                <button onClick={() => setActiveTab('candidates')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'candidates' ? '#eff6ff' : 'transparent', color: activeTab === 'candidates' ? '#2563eb' : '#475569' }}>
                  👥 Applicant Screening[cite: 3, 4]
                </button>
              </>
            )}

            {activeRole === 'admin' && (
              <>
                <button onClick={() => setActiveTab('admin-dash')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'admin-dash' ? '#eff6ff' : 'transparent', color: activeTab === 'admin-dash' ? '#2563eb' : '#475569' }}>
                  📊 Placement Analytics[cite: 3, 4]
                </button>
                <button onClick={() => setActiveTab('admin-companies')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: activeTab === 'admin-companies' ? '#eff6ff' : 'transparent', color: activeTab === 'admin-companies' ? '#2563eb' : '#475569' }}>
                  🛡️ Verify Employers[cite: 4]
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Dynamic Content Views */}
        <main>
          {activeRole === 'student' && activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>Find Your Next OJT or Career Opportunity</h2>
                <input 
                  type="text" 
                  placeholder="Search openings by title or company..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', fontSize: '14px', marginTop: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.companyName.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                  <div key={job.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px' }}>{job.type}</span>
                      <h3 style={{ margin: '12px 0 4px 0', fontSize: '16px' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>{job.companyName} • {job.location}</p>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{job.description}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>{job.stipend}</span>
                      <button 
                        onClick={() => handleApply(job)}
                        style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        Apply Now[cite: 3]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRole === 'student' && activeTab === 'applications' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Submitted Applications</h2>
              {applications.map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{app.jobTitle}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{app.companyName} • Applied: {app.appliedAt}</span>
                  </div>
                  <span style={{ backgroundColor: '#f3e8ff', color: '#9333ea', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeRole === 'employer' && activeTab === 'listings' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Active Job & OJT Postings</h2>
              {jobs.map(j => (
                <div key={j.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>{j.title}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{j.type} • Compensation: {j.stipend}</div>
                </div>
              ))}
            </div>
          )}

          {activeRole === 'employer' && activeTab === 'candidates' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Applicant Review[cite: 3, 4]</h2>
              {applications.map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong>Howen B. Tinagsa[cite: 1]</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Applied for: {app.jobTitle}</div>
                  </div>
                  <select 
                    value={app.status}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApplications(applications.map(a => a.id === app.id ? {...a, status: val} : a));
                      showToast(`Status updated to: ${val}`);
                    }}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option>Submitted</option>
                    <option>Reviewing</option>
                    <option>Shortlisted</option>
                    <option>Interview Scheduled</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {activeRole === 'admin' && activeTab === 'admin-dash' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Total Active Listings</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px' }}>{jobs.length}</h3>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Total Applications</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px' }}>{applications.length}</h3>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Placement Success Rate</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#059669' }}>85.4%</h3>
              </div>
            </div>
          )}

          {activeRole === 'admin' && activeTab === 'admin-companies' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Company Verification Queue[cite: 4]</h2>
              {companies.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Industry: {c.industry}</div>
                  </div>
                  <div>
                    {c.status === 'Verified' ? (
                      <span style={{ color: '#059669', fontSize: '12px', fontWeight: 'bold' }}>✓ Verified</span>
                    ) : (
                      <button onClick={() => verifyCompany(c.id)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        Verify Company
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
