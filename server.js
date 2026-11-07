// server.js - Complete Full-Stack Express Backend for Local Connect
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Enable CORS for Vercel and local development
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'local_connect_secret_key_2026';

// Configure Multer for PDF resume & document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('image')) cb(null, true);
    else cb(new Error('Only PDF resumes and image files are allowed!'), false);
  }
});

// Relational Mock Database
let db = {
  users: [
    { id: '1', name: 'Owen (Student)', email: 'student@icct.edu.ph', password: 'password123', role: 'student', status: 'active', completedHours: 120, totalRequiredHours: 500 },
    { id: '2', name: 'TechSolutions HR', email: 'hr@techsolutions.com', password: 'password123', role: 'employer', status: 'verified' },
    { id: '3', name: 'Placement Coordinator', email: 'admin@localconnect.gov.ph', password: 'password123', role: 'admin', status: 'active' }
  ],
  companies: [
    { id: 1, employerId: '2', name: 'TechSolutions Inc.', industry: 'Information Technology', location: 'San Mateo, Rizal', status: 'Verified', dateApplied: '2026-09-01' },
    { id: 2, employerId: '4', name: 'Apex Logistics & Transport', industry: 'Logistics', location: 'Antipolo City', status: 'Pending Review', dateApplied: '2026-10-12' },
    { id: 3, employerId: '5', name: 'Greenfield Health Systems', industry: 'Healthcare', location: 'Marikina City', status: 'Pending Review', dateApplied: '2026-10-14' }
  ],
  jobs: [
    {
      id: 1,
      employerId: '2',
      companyName: 'TechSolutions Inc.',
      title: 'Junior Software Engineer (OJT)',
      category: 'IT / Web Dev',
      type: 'OJT / Internship',
      mode: 'On-site',
      location: 'San Mateo, Rizal',
      stipend: 'PHP 500 / day',
      description: 'Seeking motivated IT students for full-stack web development internship using React and Node.js.',
      posted: '2 days ago',
      status: 'Active'
    },
    {
      id: 2,
      employerId: '2',
      companyName: 'Metro Health Center',
      title: 'Administrative Assistant OJT',
      category: 'Administrative',
      type: 'OJT / Internship',
      mode: 'Hybrid',
      location: 'Marikina City',
      stipend: 'PHP 400 / day',
      description: 'Assist municipal health records management, document processing, and patient coordination.',
      posted: '1 day ago',
      status: 'Active'
    },
    {
      id: 3,
      employerId: '2',
      companyName: 'Global Logistics Corp',
      title: 'Data Entry Analyst',
      category: 'Data & Analytics',
      type: 'Full-time Job',
      mode: 'Remote',
      location: 'Antipolo City',
      stipend: 'PHP 18,000 / month',
      description: 'Manage local transport schedules, route optimization logs, and database entry updates.',
      posted: 'Just now',
      status: 'Active'
    }
  ],
  applications: [
    {
      id: 101,
      jobId: 1,
      jobTitle: 'Junior Software Engineer (OJT)',
      companyName: 'TechSolutions Inc.',
      studentId: '1',
      studentName: 'Owen (Student)',
      studentEmail: 'student@icct.edu.ph',
      appliedDate: '2026-10-10',
      status: 'Interview Scheduled',
      resumeUrl: '/uploads/sample_resume.pdf'
    }
  ]
};

// Middleware to verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION API ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please use demo account details.' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      completedHours: user.completedHours || 0,
      totalRequiredHours: user.totalRequiredHours || 500
    }
  });
});

// --- STUDENT OJT HOURS API ---
app.patch('/api/student/hours', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Unauthorized' });
  
  const { hoursToAdd } = req.body;
  const user = db.users.find(u => u.id === req.user.userId);
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.completedHours = (user.completedHours || 120) + parseInt(hoursToAdd || 0);
  user.totalRequiredHours = user.totalRequiredHours || 500;

  res.json({ 
    message: 'Hours updated successfully', 
    completedHours: user.completedHours,
    totalRequiredHours: user.totalRequiredHours 
  });
});

// --- JOBS API ---
app.get('/api/jobs', (req, res) => {
  res.json(db.jobs);
});

app.post('/api/jobs', authenticateToken, (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'Unauthorized' });

  const { title, companyName, category, type, mode, location, stipend, description } = req.body;
  const newJob = {
    id: db.jobs.length + 1,
    employerId: req.user.userId,
    companyName: companyName || req.user.name,
    title,
    category,
    type,
    mode,
    location,
    stipend,
    description,
    posted: 'Just now',
    status: 'Active'
  };

  db.jobs.unshift(newJob);
  res.status(201).json({ message: 'Job posted successfully', job: newJob });
});

// --- APPLICATIONS API ---
app.get('/api/applications/student', authenticateToken, (req, res) => {
  const userApps = db.applications.filter(a => a.studentId === req.user.userId);
  res.json(userApps);
});

app.post('/api/applications', authenticateToken, upload.single('resume'), (req, res) => {
  const { jobId } = req.body;
  const targetJob = db.jobs.find(j => j.id === parseInt(jobId));

  if (!targetJob) return res.status(404).json({ error: 'Job not found' });

  const newApp = {
    id: Date.now(),
    jobId: targetJob.id,
    jobTitle: targetJob.title,
    companyName: targetJob.companyName,
    studentId: req.user.userId,
    studentName: req.user.name,
    studentEmail: req.user.email,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Under Review',
    resumeUrl: req.file ? `/uploads/${req.file.filename}` : '/uploads/sample_resume.pdf'
  };

  db.applications.unshift(newApp);
  res.status(201).json({ message: 'Application submitted successfully', application: newApp });
});

app.get('/api/applications/employer', authenticateToken, (req, res) => {
  res.json(db.applications);
});

app.patch('/api/applications/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const appItem = db.applications.find(a => a.id === parseInt(req.params.id));
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  appItem.status = status;
  res.json({ message: 'Status updated', application: appItem });
});

// --- ADMIN API ---
app.get('/api/admin/analytics', authenticateToken, (req, res) => {
  const totalHired = db.applications.filter(a => a.status === 'Hired').length;
  const totalApps = db.applications.length;
  res.json({
    totalListings: db.jobs.length,
    totalApplications: totalApps,
    placedStudents: 128 + totalHired,
    partnerCompanies: db.companies.length,
    pendingVerifications: db.companies.filter(c => c.status === 'Pending Review').length,
    placementRate: totalApps ? ((totalHired / totalApps) * 100).toFixed(1) + '%' : '92%'
  });
});

app.get('/api/admin/companies', authenticateToken, (req, res) => {
  res.json(db.companies);
});

app.patch('/api/admin/companies/:id/verify', authenticateToken, (req, res) => {
  const company = db.companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found' });

  company.status = 'Verified';
  res.json({ message: 'Company verified successfully', company });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Local Connect Backend running on port ${PORT}`));// server.js - Complete Full-Stack Express Backend for Local Connect
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'local_connect_secret_key_2026';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('image')) cb(null, true);
    else cb(new Error('Only PDF resumes and image files are allowed!'), false);
  }
});

let db = {
  users: [
    { id: '1', name: 'Owen (Student)', email: 'student@icct.edu.ph', password: 'password123', role: 'student', status: 'active', completedHours: 120, totalRequiredHours: 500 },
    { id: '2', name: 'TechSolutions HR', email: 'hr@techsolutions.com', password: 'password123', role: 'employer', status: 'verified' },
    { id: '3', name: 'Placement Coordinator', email: 'admin@localconnect.gov.ph', password: 'password123', role: 'admin', status: 'active' }
  ],
  companies: [
    { id: 1, employerId: '2', name: 'TechSolutions Inc.', industry: 'Information Technology', location: 'San Mateo, Rizal', status: 'Verified', dateApplied: '2026-09-01' },
    { id: 2, employerId: '4', name: 'Apex Logistics & Transport', industry: 'Logistics', location: 'Antipolo City', status: 'Pending Review', dateApplied: '2026-10-12' },
    { id: 3, employerId: '5', name: 'Greenfield Health Systems', industry: 'Healthcare', location: 'Marikina City', status: 'Pending Review', dateApplied: '2026-10-14' }
  ],
  jobs: [
    {
      id: 1,
      employerId: '2',
      companyName: 'TechSolutions Inc.',
      title: 'Junior Software Engineer (OJT)',
      category: 'IT / Web Dev',
      type: 'OJT / Internship',
      mode: 'On-site',
      location: 'San Mateo, Rizal',
      stipend: 'PHP 500 / day',
      description: 'Seeking motivated IT students for full-stack web development internship using React and Node.js.',
      posted: '2 days ago',
      status: 'Active'
    },
    {
      id: 2,
      employerId: '2',
      companyName: 'Metro Health Center',
      title: 'Administrative Assistant OJT',
      category: 'Administrative',
      type: 'OJT / Internship',
      mode: 'Hybrid',
      location: 'Marikina City',
      stipend: 'PHP 400 / day',
      description: 'Assist municipal health records management, document processing, and patient coordination.',
      posted: '1 day ago',
      status: 'Active'
    }
  ],
  applications: [
    {
      id: 101,
      jobId: 1,
      jobTitle: 'Junior Software Engineer (OJT)',
      companyName: 'TechSolutions Inc.',
      studentId: '1',
      studentName: 'Owen (Student)',
      studentEmail: 'student@icct.edu.ph',
      appliedDate: '2026-10-10',
      status: 'Interview Scheduled',
      resumeUrl: '/uploads/sample_resume.pdf'
    }
  ]
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please use demo account details.' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      completedHours: user.completedHours || 120,
      totalRequiredHours: user.totalRequiredHours || 500
    }
  });
});

app.patch('/api/student/hours', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Unauthorized' });
  
  const { hoursToAdd } = req.body;
  const user = db.users.find(u => u.id === req.user.userId);
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.completedHours = (user.completedHours || 120) + parseInt(hoursToAdd || 0);
  user.totalRequiredHours = user.totalRequiredHours || 500;

  res.json({ 
    message: 'Hours updated successfully', 
    completedHours: user.completedHours,
    totalRequiredHours: user.totalRequiredHours 
  });
});

app.get('/api/jobs', (req, res) => {
  res.json(db.jobs);
});

app.post('/api/jobs', authenticateToken, (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'Unauthorized' });

  const { title, companyName, category, type, mode, location, stipend, description } = req.body;
  const newJob = {
    id: Date.now(),
    employerId: req.user.userId,
    companyName: companyName || req.user.name,
    title,
    category,
    type,
    mode,
    location,
    stipend,
    description,
    posted: 'Just now',
    status: 'Active'
  };

  db.jobs.unshift(newJob);
  res.status(201).json({ message: 'Job posted successfully', job: newJob });
});

// --- NEW: Delete Job Endpoint ---
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'Unauthorized' });

  const jobId = parseInt(req.params.id);
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);

  if (jobIndex === -1) return res.status(404).json({ error: 'Job listing not found' });

  db.jobs.splice(jobIndex, 1);
  res.json({ message: 'Job listing deleted successfully' });
});

app.get('/api/applications/student', authenticateToken, (req, res) => {
  const userApps = db.applications.filter(a => a.studentId === req.user.userId);
  res.json(userApps);
});

app.post('/api/applications', authenticateToken, upload.single('resume'), (req, res) => {
  const { jobId } = req.body;
  const targetJob = db.jobs.find(j => j.id === parseInt(jobId));

  if (!targetJob) return res.status(404).json({ error: 'Job not found' });

  const newApp = {
    id: Date.now(),
    jobId: targetJob.id,
    jobTitle: targetJob.title,
    companyName: targetJob.companyName,
    studentId: req.user.userId,
    studentName: req.user.name,
    studentEmail: req.user.email,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Under Review',
    resumeUrl: req.file ? `/uploads/${req.file.filename}` : '/uploads/sample_resume.pdf'
  };

  db.applications.unshift(newApp);
  res.status(201).json({ message: 'Application submitted successfully', application: newApp });
});

app.get('/api/applications/employer', authenticateToken, (req, res) => {
  res.json(db.applications);
});

app.patch('/api/applications/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const appItem = db.applications.find(a => a.id === parseInt(req.params.id));
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  appItem.status = status;
  res.json({ message: 'Status updated', application: appItem });
});

app.get('/api/admin/companies', authenticateToken, (req, res) => {
  res.json(db.companies);
});

app.patch('/api/admin/companies/:id/verify', authenticateToken, (req, res) => {
  const company = db.companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found' });

  company.status = 'Verified';
  res.json({ message: 'Company verified successfully', company });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));