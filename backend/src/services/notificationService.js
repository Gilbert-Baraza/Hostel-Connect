const Notification = require('../models/Notification');
const User = require('../models/User');

const NOTIFICATION_TYPES = new Set(['booking', 'system', 'complaint', 'admin']);

const normalizeText = (value, maxLength) => {
  if (!value) return '';
  const normalized = String(value).trim();
  if (maxLength && normalized.length > maxLength) {
    return normalized.slice(0, maxLength);
  }
  return normalized;
};

const validatePayload = ({ userId, title, message, type }) => {
  if (!userId) throw new Error('Notification userId is required');
  if (!title) throw new Error('Notification title is required');
  if (!message) throw new Error('Notification message is required');
  if (!type || !NOTIFICATION_TYPES.has(type)) {
    throw new Error('Notification type is invalid');
  }
};

/**
 * Create a single notification.
 * Future-ready: extend here to also enqueue email/SMS.
 */
const createNotification = async ({ userId, title, message, type }) => {
  validatePayload({ userId, title, message, type });

  const notification = new Notification({
    userId,
    title: normalizeText(title, 200),
    message: normalizeText(message, 2000),
    type
  });

  await notification.save();
  return notification;
};

const createNotificationsForUsers = async ({ userIds, title, message, type }) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { insertedCount: 0 };
  }

  const normalizedTitle = normalizeText(title, 200);
  const normalizedMessage = normalizeText(message, 2000);
  const filteredIds = userIds.filter(Boolean);

  if (!normalizedTitle || !normalizedMessage || !NOTIFICATION_TYPES.has(type)) {
    throw new Error('Notification payload is invalid');
  }

  const docs = filteredIds.map((userId) => ({
    userId,
    title: normalizedTitle,
    message: normalizedMessage,
    type,
    isRead: false
  }));

  if (docs.length === 0) {
    return { insertedCount: 0 };
  }

  await Notification.insertMany(docs, { ordered: false });
  return { insertedCount: docs.length };
};

const createAdminNotification = async ({ title, message, type = 'admin' }) => {
  const admins = await User.find({ role: 'admin', status: { $ne: 'deactivated' } })
    .select('_id')
    .lean();
  const adminIds = admins.map((admin) => admin._id);
  return createNotificationsForUsers({ userIds: adminIds, title, message, type });
};

const createSystemNotification = async ({ title, message, type = 'system' }) => {
  const users = await User.find({ status: 'active' })
    .select('_id')
    .lean();
  const userIds = users.map((user) => user._id);
  return createNotificationsForUsers({ userIds, title, message, type });
};

const queueTask = (fn) => {
  setImmediate(() => {
    fn().catch((error) => {
      console.error('Notification dispatch error:', error);
    });
  });
};

const queueNotification = (payload) => {
  queueTask(() => createNotification(payload));
};

const queueAdminNotification = (payload) => {
  queueTask(() => createAdminNotification(payload));
};

const queueSystemNotification = (payload) => {
  queueTask(() => createSystemNotification(payload));
};

const getUserNotifications = async (userId, options = {}) => {
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const query = { userId };

  if (options.isRead !== undefined) {
    query.isRead = options.isRead === true || options.isRead === 'true';
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const markNotificationRead = async (notificationId, userId) => {
  const result = await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { isRead: true } }
  );

  return result.modifiedCount > 0;
};

const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return result.modifiedCount || 0;
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
  createAdminNotification,
  createSystemNotification,
  queueNotification,
  queueAdminNotification,
  queueSystemNotification,
  getUserNotifications,
  markNotificationRead,
  markAllRead
};
