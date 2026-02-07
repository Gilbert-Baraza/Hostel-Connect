const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, roleMiddleware('admin'));

// Overview
router.get('/overview', adminController.getOverview);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Landlords
router.get('/landlords', adminController.getLandlords);
router.patch('/landlords/:id/verify', adminController.verifyLandlord);

// Reports
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReport);

module.exports = router;
