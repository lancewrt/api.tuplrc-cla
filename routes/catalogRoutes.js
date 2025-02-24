import express from 'express';
import { catalog } from '../controller/catalogController.js';

const router = express.Router();

router.get("/", catalog)


export default router;