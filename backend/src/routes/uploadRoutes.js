const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { isLandlordOrAdmin } = require('../middleware/roleMiddleware');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});

// Upload hostel images (landlord/admin)
router.post(
  '/hostel-images',
  authMiddleware,
  isLandlordOrAdmin,
  upload.array('images', 10),
  uploadController.uploadHostelImages
);

module.exports = router;
