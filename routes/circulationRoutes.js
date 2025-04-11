import express from "express";
import { checkIn, checkinSearch, checkOut, checkoutRecord, checkoutSearch } from "../controller/circulationController.js";

export const circulationRoutesWss = (wss)=>{
    const router = express.Router();

    router.get('/checkout/search', checkoutSearch);
    router.get('/checkin/search', checkinSearch);
    router.get('/checkout-record', checkoutRecord)
    router.post('/checkin',  (req, res) => checkIn(req, res, wss));
    router.post('/checkout', (req, res) => checkOut(req, res, wss));  

    return router; 
}

