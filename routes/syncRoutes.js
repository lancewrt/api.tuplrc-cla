import express from 'express';
import multer from 'multer';
import fs, { stat } from 'fs';
import { adviser, book, journalNewsletter, publisher, resources } from '../controller/syncController.js';
import { authors } from '../controller/dataController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        return cb(null,"./public/images")
    },
    filename:function(req,file,cb){
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

//upload: This is an instance of multer, configured to use the storage we just defined. It's ready to handle file uploads now!
const upload = multer({ storage });

router.post('/file', upload.single('file'), (req, res) => {
    console.log(req.file); // Log the uploaded file details
    const filePath = req.file.path; // Get the file path

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }

        // Send the file data as a response
        res.send(data); // This sends the file content to the frontend
        console.log(data)

        // Attempt to unlink (delete) the file after sending the response
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
    });
});

router.post('/resources', resources);
router.post('/adviser', adviser);
router.post('/authors', authors);
router.post('/publisher', publisher);
router.post('/book',upload.single('file'), book);
router.post('/journalnewsletter',upload.single('file'), journalNewsletter);

export default router;