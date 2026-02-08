const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// User notifications
router.get('/notifications/my', authMiddleware, notificationController.getMyNotifications);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markNotificationRead);
router.patch('/notifications/read-all', authMiddleware, notificationController.markAllRead);

// Admin system-wide notifications
router.post('/notifications/system',
  authMiddleware,
  roleMiddleware('admin'),
  notificationController.sendSystemNotification
);

module.exports = router;
