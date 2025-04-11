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
import { circulationRoutesWss } from "./routes/circulationRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import auditRoutes from './routes/auditRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import isbnRoutes from './routes/isbnRoutes.js';
import validateTupId from './routes/validateTupId.js';
import onlineCatalogRoutes from './routes/onlineCatalogRoutes.js';
import { attendanceRoutesWss } from './routes/attendanceRoutes.js';
import advancedSearchRoutes from './routes/advancedSearchRoutes.js';
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { approachingOverdue, checkOverdue } from './controller/overdueController.js';
import { inactivePatron } from './routes/patronInactiveController.js';

dotenv.config();

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);

  ws.send('Welcome from WebSocket server!');

  ws.on('message', (data) => {
    console.log(`Received: ${data}`);
    
    // Broadcast to all connected clients
    for (const client of clients) {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(`Broadcast: ${data}`);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Add WebSocket to request object if needed
app.use((req, res, next) => {
  req.wss = wss;
  req.clients = clients;
  next();
});

// Middleware & routes
app.use(express.json());
app.use(cors({
  origin: ['https://admin.tuplrc-cla.com', 'https://www.tuplrc-cla.com'],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true
}));    

app.use("/api/resources", resourceRoutes);
app.use("/api/data", dataRoutes); 
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patron", patronRoutes);
app.use('/api/circulation', circulationRoutesWss(wss));
app.use('/api/catalog', catalogRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/isbn', isbnRoutes);
app.use('/api/validate-tup-id', validateTupId);
app.use('/api/online-catalog', onlineCatalogRoutes);
app.use('/api/attendance', attendanceRoutesWss(wss));
app.use('/api/advanced-search', advancedSearchRoutes);

// CRON JOBS
cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check overdue resources');
  checkOverdue(wss); // pass WebSocketServer if needed
});

cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check approaching overdue');
  approachingOverdue();
});

cron.schedule('0 0 30 8 *', () => {
  console.log('Cron running to set patrons to inactive');
  inactivePatron();
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
