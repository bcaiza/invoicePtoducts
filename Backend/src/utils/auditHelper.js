import AuditLog from "../../models/AuditLog.js";

export const createAuditLog = async ({
  entityType,
  entityId,
  action,
  userId,
  userEmail,
  changes,
  req
}) => {
  try {
    await AuditLog.create({
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: userId,
      user_email: userEmail,
      changes,
      ip_address: req?.ip || req?.connection?.remoteAddress || req?.socket?.remoteAddress,
      user_agent: req?.headers['user-agent']
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};