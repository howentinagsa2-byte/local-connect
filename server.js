// server.js - Complete Full-Stack Express Backend (Admin-only job posting, email-scoped notifications & filtered employer applicants)
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
const DB_FILE = path.join(__dirname, 'database.json');

// Persistent Database Load/Save Helpers
const loadDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: [
        { id: '1', name: 'Owen (Student)', email: 'student@icct.edu.ph', password: 'password123', role: 'student', status: 'active', completedHours: 120, totalRequiredHours: 500 },
        { id: '2', name: 'TechSolutions Inc.', email: 'hr@techsolutions.com', password: 'password123', role: 'employer', status: 'Verified' },
        { id: '3', name: 'Placement Coordinator', email: 'admin@localnet.ph', password: 'password123', role: 'admin', status: 'active' }
      ],
      companies: [
        { id: 1, employerId: '2', name: 'TechSolutions Inc.', industry: 'Information Technology', location: 'San Mateo, Rizal', status: 'Verified', dateApplied: '2026-09-01', email: 'hr@techsolutions.com' }
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
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const saveDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

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
  const db = loadDb();
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
  saveDb(db);

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

// Partner Company Application
app.post('/api/auth/partner-apply', (req, res) => {
  const db = loadDb();
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
  saveDb(db);

  res.status(201).json({ message: 'Partnership application submitted successfully! Please wait for admin approval before logging in.' });
});

app.post('/api/auth/login', (req, res) => {
  const db = loadDb();
  const { email, password } = req.body;
  
  let user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    const company = db.companies.find(c => c.email === email && c.password === password);
    if (company) {
      if (company.status !== 'Verified') {
        return res.status(403).json({ error: 'Your partnership application is still Pending Review by admin.' });
      }
      user = {
        id: company.employerId,
        name: company.name,
        email: company.email,
        role: 'employer',
        status: 'Verified'
      };
      if (!db.users.find(u => u.email === email)) {
        db.users.push({ ...user, password: company.password });
        saveDb(db);
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
  const db = loadDb();
  const { email, newPassword } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    const comp = db.companies.find(c => c.email === email);
    if (comp) {
      comp.password = newPassword;
      saveDb(db);
      return res.json({ message: 'Password updated successfully! You can now sign in once approved.' });
    }
    return res.status(404).json({ error: 'Email address not found in our system.' });
  }
  user.password = newPassword;
  saveDb(db);
  res.json({ message: 'Password updated successfully! You can now sign in with your new password.' });
});

app.patch('/api/auth/profile', authenticateToken, (req, res) => {
  const db = loadDb();
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
  saveDb(db);

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

// Student Hours Tracker Route
app.patch('/api/student/hours', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Unauthorized' });
  const { hoursToAdd, hoursToRemove, targetHours } = req.body;
  const user = db.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.completedHours === undefined) user.completedHours = 120;
  if (user.totalRequiredHours === undefined) user.totalRequiredHours = 500;

  if (hoursToAdd !== undefined) {
    user.completedHours += parseInt(hoursToAdd || 0);
  }
  if (hoursToRemove !== undefined) {
    user.completedHours = Math.max(0, user.completedHours - parseInt(hoursToRemove || 0));
  }
  if (targetHours !== undefined) {
    user.totalRequiredHours = parseInt(targetHours);
  }

  saveDb(db);

  res.json({ 
    message: 'Hours updated successfully', 
    completedHours: user.completedHours, 
    totalRequiredHours: user.totalRequiredHours 
  });
});

app.get('/api/jobs', (req, res) => {
  const db = loadDb();
  res.json(db.jobs);
});

// STRICT ADMIN-ONLY JOB POSTING
app.post('/api/jobs', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only the admin can publish OJT job postings.' });
  }
  
  const { title, companyName, category, type, mode, location, stipend, description } = req.body;
  if (!title || !companyName || !description) {
    return res.status(400).json({ error: 'Job title, company name, and description are required fields.' });
  }

  const newJob = {
    id: Date.now(),
    employerId: req.user.userId,
    companyName,
    title,
    category: category || 'General / OJT',
    type: type || 'OJT / Internship',
    mode: mode || 'On-site',
    location: location || 'Philippines',
    stipend: stipend || 'Unpaid / Negotiable',
    description,
    posted: 'Just now',
    status: 'Active'
  };

  db.jobs.unshift(newJob);
  saveDb(db);
  res.status(201).json({ message: 'Job posted successfully by Admin', job: newJob });
});

app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const jobId = parseInt(req.params.id);
  
  db.jobs = db.jobs.filter(j => j.id !== jobId);
  saveDb(db);
  res.json({ message: 'Job deleted successfully' });
});

app.get('/api/applications/student', authenticateToken, (req, res) => {
  const db = loadDb();
  res.json(db.applications.filter(a => a.studentId === req.user.userId));
});

app.post('/api/applications', authenticateToken, upload.single('resume'), (req, res) => {
  const db = loadDb();
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

  // Send notification strictly to the registered employer email matching the company name
  const employerUser = db.companies.find(c => c.name === targetJob.companyName) || db.users.find(u => u.name === targetJob.companyName);
  const employerEmail = employerUser ? employerUser.email : null;

  if (employerEmail) {
    db.notifications.unshift({
      id: Date.now(),
      recipientEmail: employerEmail,
      subject: `New Application: ${targetJob.title}`,
      body: `${req.user.name} (${req.user.email}) submitted an application for ${targetJob.title}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
  }

  saveDb(db);
  res.status(201).json({ message: 'Application submitted', application: newApp });
});

// Employer Applications: Strictly filtered so employers only see applicants who applied to their company name
app.get('/api/applications/employer', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'employer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (req.user.role === 'admin') {
    return res.json(db.applications);
  }

  // Filter applications where companyName matches the employer's company name exactly
  const employerCompanyName = req.user.name;
  const filteredApps = db.applications.filter(a => a.companyName.toLowerCase() === employerCompanyName.toLowerCase());
  
  res.json(filteredApps);
});

app.patch('/api/applications/:id/status', authenticateToken, (req, res) => {
  const db = loadDb();
  const { status } = req.body;
  const appItem = db.applications.find(a => a.id === parseInt(req.params.id));
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  appItem.status = status;

  // Send notification strictly to the registered student email
  db.notifications.unshift({
    id: Date.now(),
    recipientEmail: appItem.studentEmail,
    subject: `Application Status Updated: ${appItem.jobTitle}`,
    body: `Hello ${appItem.studentName}, your application status for ${appItem.companyName} has been updated to: ${status}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  });

  saveDb(db);
  res.json({ message: 'Status updated and notification dispatched', application: appItem });
});

app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = loadDb();
  const userEmail = req.user.email;
  const userNotifications = db.notifications.filter(n => n.recipientEmail === userEmail);
  res.json(userNotifications);
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const db = loadDb();
  const notif = db.notifications.find(n => n.id === parseInt(req.params.id));
  if (notif && notif.recipientEmail === req.user.email) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ message: 'Notification marked as read' });
});

app.get('/api/admin/export-csv', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  let csvContent = "Application ID,Student Name,Student Email,Job Title,Company,Applied Date,Status\n";
  db.applications.forEach(app => {
    csvContent += `"${app.id}","${app.studentName}","${app.studentEmail}","${app.jobTitle}","${app.companyName}","${app.appliedDate}","${app.status}"\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('LocalConnect_Placement_Report.csv');
  res.send(csvContent);
});

app.get('/api/admin/companies', authenticateToken, (req, res) => {
  const db = loadDb();
  res.json(db.companies);
});

app.patch('/api/admin/companies/:id/verify', authenticateToken, (req, res) => {
  const db = loadDb();
  const company = db.companies.find(c => c.id === parseInt(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found' });
  company.status = 'Verified';
  saveDb(db);
  res.json({ message: 'Company verified successfully', company });
});

app.delete('/api/admin/companies/:id', authenticateToken, (req, res) => {
  const db = loadDb();
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  
  const companyId = parseInt(req.params.id);
  const companyIndex = db.companies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) return res.status(404).json({ error: 'Company not found' });
  
  const removedCompany = db.companies[companyIndex];
  db.companies.splice(companyIndex, 1);
  db.users = db.users.filter(u => u.email !== removedCompany.email);
  
  saveDb(db);
  res.json({ message: 'Partnership cancelled and removed successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));