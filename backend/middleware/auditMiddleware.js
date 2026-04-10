const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userId, userName, userEmail, userRole, action, entity, entityId, details, req }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;

    await AuditLog.create({
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      },
      action,
      entity,
      entityId,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

module.exports = { logAudit };