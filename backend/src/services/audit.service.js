import { AuditLog } from "../models/auditLog.model.js";

export function logAdminAction({ admin, action, entityType, entityId, message = "", metadata = {} }) {
  return AuditLog.create({
    adminId: admin._id,
    action,
    entityType,
    entityId,
    message,
    metadata
  }).catch((error) => console.error("Audit log failed", error.message));
}
