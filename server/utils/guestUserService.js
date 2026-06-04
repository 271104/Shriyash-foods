const User = require('../models/User');
const { logUserActivity } = require('./activityLogger');

const findOrCreateGuestUser = async (sessionId, req = {}) => {
  if (!sessionId) return null;

  let user = await User.findOne({ guestSessionId: sessionId, userType: 'guest' });

  if (!user) {
    // Generate a unique phone identifier for guest (so unique index doesn't conflict)
    const guestPhone = `guest_${sessionId}`;
    
    try {
      user = await User.create({
        userType: 'guest',
        isGuest: true,
        guestSessionId: sessionId,
        phone: guestPhone,  // Assign unique guest phone
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        activityLog: [],
        stats: {
          totalCartActions: 0,
          totalOrders: 0,
          totalLogins: 0,
          lastActivityAt: new Date()
        }
      });

      await logUserActivity(user, 'GUEST_SESSION_STARTED', { sessionId }, req);
      return user;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.guestSessionId) {
        // Race condition: session was created in parallel, fetch it
        user = await User.findOne({ guestSessionId: sessionId, userType: 'guest' });
        return user;
      }
      throw error;
    }
  }

  user.lastSeenAt = new Date();
  await user.save();
  return user;
};

const linkGuestSessionToRegisteredUser = async (sessionId, registeredUser, req = {}) => {
  if (!sessionId || !registeredUser) return registeredUser;

  const guestUser = await User.findOne({ guestSessionId: sessionId, userType: 'guest' });
  if (!guestUser) return registeredUser;

  registeredUser.activityLog = registeredUser.activityLog || [];
  registeredUser.activityLog.push({
    action: 'GUEST_SESSION_LINKED',
    timestamp: new Date(),
    metadata: {
      guestUserId: guestUser._id,
      sessionId,
      guestStats: guestUser.stats,
      guestActivityCount: guestUser.activityLog?.length || 0
    },
    sessionId,
    ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null,
    userAgent: req.headers?.['user-agent'] || null
  });

  guestUser.activityLog = guestUser.activityLog || [];
  guestUser.activityLog.push({
    action: 'CONVERTED_TO_REGISTERED',
    timestamp: new Date(),
    metadata: {
      registeredUserId: registeredUser._id,
      phone: registeredUser.phone
    },
    sessionId
  });
  guestUser.stats = guestUser.stats || {};
  guestUser.stats.convertedToRegisteredAt = new Date();
  guestUser.stats.linkedRegisteredUserId = registeredUser._id;

  await guestUser.save();
  await registeredUser.save();

  return registeredUser;
};

module.exports = {
  findOrCreateGuestUser,
  linkGuestSessionToRegisteredUser
};
