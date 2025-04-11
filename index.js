import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import cron from 'node-cron';
import cookieParser from 'cookie-parser';
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

import resourceRoutes from "./routes/resourceRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import patronRoutes from "./routes/patronRoutes.js";
import circulationRoutes from "./routes/circulationRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import auditRoutes from './routes/auditRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import isbnRoutes from './routes/isbnRoutes.js';
import validateTupId from './routes/validateTupId.js';
import onlineCatalogRoutes from './routes/onlineCatalogRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import advancedSearchRoutes from './routes/advancedSearchRoutes.js';
import { createServer } from "http";
import { Server } from "socket.io";
import { approachingOverdue, checkOverdue } from './controller/overdueController.js';
import { inactivePatron } from './routes/patronInactiveController.js';

dotenv.config();

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3001;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: ['https://admin.tuplrc-cla.com', 'https://www.tuplrc-cla.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Apply CORS middleware ONCE before routes
app.use(cors({
  origin: ['https://admin.tuplrc-cla.com', 'https://www.tuplrc-cla.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Parse JSON before applying routes
app.use(express.json());

// Make io available to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add this before your routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Apply routes
app.use("/api/resources", resourceRoutes);
app.use("/api/data", dataRoutes); 
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patron", patronRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/isbn', isbnRoutes);
app.use('/api/validate-tup-id', validateTupId);
app.use('/api/online-catalog', onlineCatalogRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/advanced-search', advancedSearchRoutes);

/*--------------check overdue resources using cron-------- */
cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check overdue resources');
  checkOverdue(io);
});

/*--------------send email if overdue is approaching-------- */
cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check approaching overdue');
  approachingOverdue();
});

/*------------automatically set patrons to inactive after 4 years---------------- */
//runs at midnight, on the 30th month of august, every year
cron.schedule('0 0 30 8 *', () => {
  console.log('Cron running to set patrons to inactive');
  inactivePatron();
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for external use if needed
export { io };