import express from 'express';
import {archive, barcodeData, catalog, catalog2, update } from '../controller/catalogController.js';

const router = express.Router();

router.get("/", catalog)
router.get("/resource-status", catalog2)
router.get("/generate-barcode", barcodeData)
router.post("/", archive)
router.put("/resource-status/:id", update)


export default router;