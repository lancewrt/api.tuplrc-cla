import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import cron from 'node-cron';
import cookieParser from 'cookie-parser';
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
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
import advancedSearchRoutes from './routes/advancedSearchRoutes.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { approachingOverdue, checkOverdue } from './controller/overdueController.js';
import { inactivePatron } from './routes/patronInactiveController.js';

dotenv.config();

const corsOptions = {
  origin: ['https://admin.tuplrc-cla.com', 'https://www.tuplrc-cla.com','http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}

app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // 🔥 this handles preflight properly

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(httpServer, corsOptions);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(express.json()); 
app.use(cookieParser());  

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
app.get('/api/ping', (req, res) => {
  res.json({ msg: "API is working" });
});

/*--------------check overdue resources using cron-------- */
// check 
// change mo lang refresh token sa .env pag ayaw masend
//1. go to OAuth 2.0 Playground
//2. open gear icon and paste client id and client secret from .env file
//3. select gmail api v1 in 'select & authorize api' category
//4. select ung https://mail.google.com/ and click authorize api
//5. click exchange authorization code for tokens
//6. copy and paste new refresh token sa .env
cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check overdue resources')
  checkOverdue(io);
});

/*--------------send email if overdue is approaching-------- */
cron.schedule('0 0 * * *', () => {
  console.log('Cron running to check approaching overdue')
  approachingOverdue();
});

/*------------automatically set patrons to inactive after 4 years---------------- */
//runs at midnight, on the 30th month of august, every year
cron.schedule('0 0 30 8 *', () => {
  console.log('Cron running to set patrons to inactive');
  inactivePatron();
});

// run every minute for testing purposes
// cron.schedule('* * * * *', () => {
//   console.log('Cron running to set patrons to inactive');
//   inactivePatron();
// });

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for external use if needed
export { io };