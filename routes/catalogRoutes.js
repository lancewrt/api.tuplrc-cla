import express from 'express';
import { barcodeData, catalog } from '../controller/catalogController.js';

const router = express.Router();

router.get("/", catalog)
router.get("/generate-barcode", barcodeData)


export default router;