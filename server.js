// server.js - Complete Express.js Backend for Local Connect
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for PDF resume & verification uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('image')) cb(null, true);
    else cb(new Error('Only PDF resumes and image files are allowed!'), false);
  }
});

// Mock Database (Simulating PostgreSQL / MySQL Relational Schema)
let db = {
  users: [
    { id: 1, name: 'Howen Tinagsa', email: 'howen@student.edu', role: 'student', status: 'active' },
    { id: 2, name: 'Noel Montecillo', email: 'noel.admin@localconnect.gov', role: 'admin', status: 'active' },
    { id: 3, name: 'TechSolutions HR', email: 'hr@techsolutions.com', role: 'employer', status: 'verified' }
  ],
  companies: [
    { id: 1, employerId: 3, name: 'TechSolutions Inc.', industry: 'Information Technology', status: 'Verified', verifiedBy: 2 }
  ],
  jobs: [
    { id: 1, employerId: 3, companyName: 'TechSolutions Inc.', title: 'Junior Software Engineer (OJT)', type: 'OJT / Internship', category: 'Information Technology', location: 'On-site', description: 'Seeking motivated IT students for full-stack web development internship using React and Node.js.', deadline: '2026-10-30', stipend: 'PHP 500 / day', status: 'Active' },
    { id: 2, employerId: 3, companyName: 'TechSolutions Inc.', title: 'IT Support Specialist', type: 'Full-time Job', category: 'Information Technology', location: 'Hybrid', description: 'Manage network infrastructure and technical support for local community offices.', deadline: '2026-11-15', stipend: 'PHP 22,000 / month', status: 'Active' }
  ],
  applications: [
    { id: 1, jobId: 1, studentId: 1, studentName: 'Howen Tinagsa', studentEmail: 'howen@student.edu', resumeUrl: '/uploads/sample_resume.pdf', status: 'Interview Scheduled', appliedAt: '2026-09-15' }
  ],
  notifications: [
    { id: 1, userId: 1, message: 'Your application for Junior Software Engineer (OJT) was moved to Interview Scheduled.', date: '2026-09-18', read: false }
  ]
};

// --- AUTHENTICATION & USERS ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json({ message: 'Login successful', user });
});

app.get('/api/users', (req, res) => {
  res.json(db.users);
});

// --- JOB SEEKER / STUDENT ENDPOINTS ---
app.get('/api/jobs', (req, res) => {
  const { category, type, search } = req.query;
  let results = db.jobs.filter(j => j.status === 'Active');
  if (category) results = results.filter(j => j.category.toLowerCase() === category.toLowerCase());
  if (type) results = results.filter(j => j.type.toLowerCase().includes(type.toLowerCase()));
  if (search) results = results.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.companyName.toLowerCase().includes(search.toLowerCase()));
  res.json(results);
});

app.post('/api/applications', upload.single('resume'), (req, res) => {
  const { jobId, studentId, studentName, studentEmail } = req.body;
  const resumeUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.pdf';
  
  const newApp = {
    id: db.applications.length + 1,
    jobId: parseInt(jobId),
    studentId: parseInt(studentId),
    studentName,
    studentEmail,
    resumeUrl,
    status: 'Submitted',
    appliedAt: new Date().toISOString().split('T')[0]
  };
  
  db.applications.push(newApp);
  db.notifications.push({
    id: db.notifications.length + 1,
    userId: parseInt(studentId),
    message: `Your application has been successfully submitted!`,
    date: new Date().toISOString().split('T')[0],
    read: false
  });
  
  res.status(201).json({ message: 'Application submitted successfully', application: newApp });
});

app.get('/api/applications/student/:studentId', (req, res) => {
  const apps = db.applications.filter(a => a.studentId === parseInt(req.params.studentId));
  res.json(apps);
});

// --- EMPLOYER / RECRUITER ENDPOINTS ---
app.get('/api/employer/jobs/:employerId', (req, res) => {
  const jobs = db.jobs.filter(j => j.employerId === parseInt(req.params.employerId));
  res.json(jobs);
});

app.post('/api/employer/jobs', (req, res) => {
  const { employerId, companyName, title, type, category, location, description, deadline, stipend } = req.body;
  const newJob = {
    id: db.jobs.length + 1,
    employerId: parseInt(employerId),
    companyName,
    title,
    type,
    category,
    location,
    description,
    deadline,
    stipend,
    status: 'Active'
  };
  db.jobs.push(newJob);
  res.status(201).json({ message: 'Job posting created successfully', job: newJob });
});

app.get('/api/employer/applications/:employerId', (req, res) => {
  const employerJobs = db.jobs.filter(j => j.employerId === parseInt(req.params.employerId)).map(j => j.id);
  const apps = db.applications.filter(a => employerJobs.includes(a.jobId));
  res.json(apps);
});

app.patch('/api/applications/:id/status', (req, res) => {
  const { status } = req.body; // Reviewing, Shortlisted, Interview Scheduled, Hired, Rejected
  const app = db.applications.find(a => a.id === parseInt(req.params.id));
  if (!app) return res.status(404).json({ error: 'Application not found' });
  
  app.status = status;
  db.notifications.push({
    id: db.notifications.length + 1,
    userId: app.studentId,
    message: `Your application status updated to: ${status}`,
    date: new Date().toISOString().split('T')[0],
    read: false
  });
  
  res.json({ message: 'Application status updated successfully', application: app });
});

// --- PLACEMENT ADMIN ENDPOINTS ---
app.get('/api/admin/analytics', (req, res) => {
  res.json({
    totalListings: db.jobs.length,
    totalApplications: db.applications.length,
    totalHired: db.applications.filter(a => a.status === 'Hired').length,
    placementRate: db.applications.length ? ((db.applications.filter(a => a.status === 'Hired').length / db.applications.length) * 100).toFixed(1) + '%' : '0%',
    activePartners: db.companies.filter(c => c.status === 'Verified').length
  });
});

app.get('/api/admin/companies', (req, res) => {
  res.json(db.companies);
});

app.patch('/api/admin/companies/:id/verify', (req, res) => {
  const company = db.companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found' });
  company.status = 'Verified';
  res.json({ message: 'Company verified successfully', company });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Local Connect Backend running on port ${PORT}`));
const API_BASE_URL = "https://local-connect-api-t9jx.onrender.com";
