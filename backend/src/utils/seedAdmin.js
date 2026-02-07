const User = require('../models/User');

const normalizeFlag = (value) => {
  if (!value) return false;
  return String(value).toLowerCase() === 'true';
};

const ensureAdminUser = async () => {
  const enabled = normalizeFlag(process.env.ADMIN_SEED_ENABLED);
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const name = process.env.ADMIN_SEED_NAME || 'Admin';
  const updatePassword = normalizeFlag(process.env.ADMIN_SEED_UPDATE_PASSWORD);

  if (!enabled || !email || !password) {
    return;
  }

  const existing = await User.findOne({ email }).select('+passwordHash');

  if (!existing) {
    const admin = new User({
      name,
      email,
      passwordHash: password,
      role: 'admin',
      isVerified: true,
      status: 'active'
    });

    await admin.save();
    console.log(`Seeded admin user: ${email}`);
    return;
  }

  let updated = false;

  if (existing.role !== 'admin') {
    existing.role = 'admin';
    updated = true;
  }

  if (updatePassword) {
    existing.passwordHash = password;
    updated = true;
  }

  if (!existing.isVerified) {
    existing.isVerified = true;
    updated = true;
  }

  if (existing.status !== 'active') {
    existing.status = 'active';
    updated = true;
  }

  if (updated) {
    await existing.save();
    console.log(`Updated admin user: ${email}`);
  }
};

module.exports = { ensureAdminUser };
