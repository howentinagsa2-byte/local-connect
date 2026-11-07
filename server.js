// server.js - Complete Full-Stack Express Backend (ES Module Syntax)
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
      employerId: '3',
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
  ],
  notifications: [
    { id: 1, recipientEmail: 'student@icct.edu.ph', subject: 'Application Status Update', body: 'Your application for Junior Software Engineer (OJT) has been updated to: Interview Scheduled.', timestamp: '10:28 AM', read: false }
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
  if (!user) return res.status(401).json({ error: 'Invalid credentials. Please use demo account details.' });

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
  const { hoursToAdd, targetHours } = req.body;
  const user = db.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (hoursToAdd !== undefined) {
    user.completedHours = (user.completedHours || 120) + parseInt(hoursToAdd || 0);
  }
  if (targetHours !== undefined) {
    user.totalRequiredHours = parseInt(targetHours);
  }

  res.json({ message: 'Hours updated successfully', completedHours: user.completedHours, totalRequiredHours: user.totalRequiredHours });
});

app.get('/api/jobs', (req, res) => res.json(db.jobs));

app.post('/api/jobs', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { title, companyName, category, type, mode, location, stipend, description } = req.body;
  const newJob = {
    id: Date.now(),
    employerId: req.user.userId,
    companyName: companyName || 'Admin Official Posting',
    title, category, type, mode, location, stipend, description,
    posted: 'Just now',
    status: 'Active'
  };
  db.jobs.unshift(newJob);
  res.status(201).json({ message: 'Job posted successfully', job: newJob });
});

app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const jobId = parseInt(req.params.id);
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) return res.status(404).json({ error: 'Job not found' });
  db.jobs.splice(jobIndex, 1);
  res.json({ message: 'Job deleted successfully' });
});

app.get('/api/applications/student', authenticateToken, (req, res) => {
  res.json(db.applications.filter(a => a.studentId === req.user.userId));
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

  const employerUser = db.users.find(u => u.name === targetJob.companyName || u.role === 'employer');
  if (employerUser) {
    db.notifications.unshift({
      id: Date.now(),
      recipientEmail: employerUser.email,
      subject: `New Application: ${targetJob.title}`,
      body: `${req.user.name} submitted an application for ${targetJob.title}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
  }

  res.status(201).json({ message: 'Application submitted', application: newApp });
});

app.get('/api/applications/employer', authenticateToken, (req, res) => res.json(db.applications));

app.patch('/api/applications/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const appItem = db.applications.find(a => a.id === parseInt(req.params.id));
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  appItem.status = status;
  db.notifications.unshift({
    id: Date.now(),
    recipientEmail: appItem.studentEmail,
    subject: `Application Status Updated: ${appItem.jobTitle}`,
    body: `Hello ${appItem.studentName}, your application status for ${appItem.companyName} has been updated to: ${status}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  });

  res.json({ message: 'Status updated and notification dispatched', application: appItem });
});

app.get('/api/notifications', authenticateToken, (req, res) => {
  res.json(db.notifications.filter(n => n.recipientEmail === req.user.email));
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = db.notifications.find(n => n.id === parseInt(req.params.id));
  if (notif) notif.read = true;
  res.json({ message: 'Notification marked as read' });
});

app.get('/api/admin/export-csv', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  let csvContent = "Application ID,Student Name,Student Email,Job Title,Company,Applied Date,Status\n";
  db.applications.forEach(app => {
    csvContent += `"${app.id}","${app.studentName}","${app.studentEmail}","${app.jobTitle}","${app.companyName}","${app.appliedDate}","${app.status}"\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('LocalConnect_Placement_Report.csv');
  res.send(csvContent);
});

app.get('/api/admin/companies', authenticateToken, (req, res) => res.json(db.companies));

app.patch('/api/admin/companies/:id/verify', authenticateToken, (req, res) => {
  const company = db.companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found' });
  company.status = 'Verified';
  res.json({ message: 'Company verified successfully', company });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));