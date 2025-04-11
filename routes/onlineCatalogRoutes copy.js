import express from 'express'
import { featuredBook, featuredBooks, journalNewsletter, resources, resourcesView } from '../controller/onlineCatalogController.js'



export const circulationRoutesWss = (wss)=>{
    const router = express.Router();

    router.get('/checkout/search', checkoutSearch);
    router.get('/checkin/search', checkinSearch);
    router.get('/checkout-record', checkoutRecord)
    router.post('/checkin',  (req, res) => checkIn(req, res, wss));
    router.post('/checkout', (req, res) => checkOut(req, res, wss));  

    return router; 
}
