import express from 'express';
import { attendance } from '../controller/attendanceController.js';

// Export a function that takes wss and returns a router
export const attendanceRoutesWss = (wss)=> {
  const router = express.Router();

  // Pass wss to your controller function
  router.post('/', (req, res) => attendance(req, res, wss));

  return router;
}
