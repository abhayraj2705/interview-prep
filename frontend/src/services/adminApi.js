import api from "./api";

export const adminApi = {
  summary: () => api.get("/admin/summary"),
  systemHealth: () => api.get("/admin/system-health"),
  users: (params) => api.get("/admin/users", { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  tasks: (params) => api.get("/admin/tasks", { params }),
  roadmaps: (params) => api.get("/admin/roadmaps", { params }),
  roadmap: (id) => api.get(`/admin/roadmaps/${id}`),
  deleteRoadmap: (id) => api.delete(`/admin/roadmaps/${id}`),
  aiPlans: (params) => api.get("/admin/ai-plans", { params }),
  emails: (params) => api.get("/admin/emails", { params }),
  retryEmail: (id) => api.post(`/admin/emails/${id}/retry`),
  auditLogs: (params) => api.get("/admin/audit-logs", { params })
};
