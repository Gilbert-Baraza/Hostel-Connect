const notificationService = require('../services/notificationService');

const ALLOWED_TYPES = new Set(['booking', 'system', 'complaint', 'admin']);

const toNumber = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Get logged-in user's notifications
 * GET /notifications/my
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toNumber(req.query.limit, 20), 1), 100);
    const { isRead } = req.query;

    const result = await notificationService.getUserNotifications(req.userId, {
      page,
      limit,
      isRead
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching notifications'
    });
  }
};

/**
 * Mark a notification as read
 * PATCH /notifications/:id/read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await notificationService.markNotificationRead(id, req.userId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating notification'
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
exports.markAllRead = async (req, res) => {
  try {
    const updatedCount = await notificationService.markAllRead(req.userId);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: { updatedCount }
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating notifications'
    });
  }
};

/**
 * Send system-wide notification (admin)
 * POST /notifications/system
 */
exports.sendSystemNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    if (type && !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    notificationService.queueSystemNotification({
      title,
      message,
      type: type || 'system'
    });

    res.status(202).json({
      success: true,
      message: 'System notification queued'
    });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending notification'
    });
  }
};
