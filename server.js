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
    { id: '2', name: 'TechSolutions Inc.', email: 'hr@techsolutions.com', password: 'password123', role: 'employer', status: 'Verified' },
    { id: '3', name: 'Placement Coordinator', email: 'admin@localnet.ph', password: 'password123', role: 'admin', status: 'active' }
  ],
  companies: [
    { id: 1, employerId: '2', name: 'TechSolutions Inc.', industry: 'Information Technology', location: 'San Mateo, Rizal', status: 'Verified', dateApplied: '2026-09-01', email: 'hr@techsolutions.com' },
    { id: 2, employerId: '4', name: 'Apex Logistics & Transport', industry: 'Logistics', location: 'Antipolo City', status: 'Pending Review', dateApplied: '2026-10-12', email: 'apex@logistics.com' },
    { id: 3, employerId: '5', name: 'Greenfield Health Systems', industry: 'Healthcare', location: 'Marikina City', status: 'Pending Review', dateApplied: '2026-10-14', email: 'hr@greenfield.com' }
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

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (role === 'admin' && email !== 'admin@localnet.ph') {
    return res.status(403).json({ error: 'Unauthorized: Admin registration is restricted.' });
  }

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role,
    status: 'active',
    completedHours: role === 'student' ? 0 : undefined,
    totalRequiredHours: role === 'student' ? 500 : undefined
  };

  db.users.push(newUser);

  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      completedHours: newUser.completedHours || 0,
      totalRequiredHours: newUser.totalRequiredHours || 500
    }
  });
});

// Partner Company Application (Requires Admin Approval Before Login)
app.post('/api/auth/partner-apply', (req, res) => {
  const { name, industry, location, email, password } = req.body;
  if (!name || !industry || !location || !email || !password) {
    return res.status(400).json({ error: 'All partnership fields are required.' });
  }

  const existingComp = db.companies.find(c => c.email === email);
  if (existingComp) {
    return res.status(400).json({ error: 'A partnership application with this email already exists.' });
  }

  const newCompanyId = Date.now();
  db.companies.push({
    id: newCompanyId,
    employerId: String(newCompanyId),
    name,
    industry,
    location,
    status: 'Pending Review',
    dateApplied: new Date().toISOString().split('T')[0],
    email,
    password
  });

  res.status(201).json({ message: 'Partnership application submitted successfully! Please wait for admin approval before logging in.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check users table first
  let user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    // Check if trying to log in as an employer whose company was verified
    const company = db.companies.find(c => c.email === email && c.password === password);
    if (company) {
      if (company.status !== 'Verified') {
        return res.status(403).json({ error: 'Your partnership application is still Pending Review by admin.' });
      }
      // Auto-register into users if approved
      user = {
        id: company.employerId,
        name: company.name,
        email: company.email,
        role: 'employer',
        status: 'Verified'
      };
      if (!db.users.find(u => u.email === email)) {
        db.users.push({ ...user, password: company.password });
      }
    }
  }

  if (!user) return res.status(401).json({ error: 'Invalid credentials or partnership not yet approved.' });

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

app.post('/api/auth/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    const comp = db.companies.find(c => c.email === email);
    if (comp) {
      comp.password = newPassword;
      return res.json({ message: 'Password updated successfully! You can now sign in once approved.' });
    }
    return res.status(404).json({ error: 'Email address not found in our system.' });
  }
  user.password = newPassword;
  res.json({ message: 'Password updated successfully! You can now sign in with your new password.' });
});

app.patch('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, email, newPassword } = req.body;
  const user = db.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (email && email !== user.email) {
    const emailExists = db.users.find(u => u.email === email);
    if (emailExists) return res.status(400).json({ error: 'Email is already in use by another account.' });
    user.email = email;
  }

  if (name) user.name = name;
  if (newPassword) user.password = newPassword;

  const newToken = jwt.sign(
    { userId: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Profile updated successfully',
    token: newToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      completedHours: user.completedHours,
      totalRequiredHours: user.totalRequiredHours
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