import express from 'express';
import { reports } from '../controller/reportsController.js';

const router = express.Router();

router.get('/', reports);

export default router;