import express from 'express';
import { advisers, authors, college, course, departments, publishers, roles, status, topic, type } from '../controller/dataController.js';

const router = express.Router();

router.get('/college', college);
router.get('/course', course);
router.get('/departments', departments);
router.get('/topic', topic);
router.get('/publishers', publishers);
router.get('/authors', authors);
router.get('/advisers', advisers);
router.get('/type', type);
router.get('/status', status);
router.get('/roles', roles);

export default router;