import api from "./api";

export const taskApi = {
  list: (params) => api.get("/tasks", { params }),
  today: (params) => api.get("/tasks/today", { params }),
  sendTodayReminder: () => api.post("/tasks/today/reminder-email"),
  create: (payload) => api.post("/tasks", payload),
  update: (id, payload) => api.put(`/tasks/${id}`, payload),
  remove: (id) => api.delete(`/tasks/${id}`),
  removeAll: (params) => api.delete("/tasks", { params }),
  complete: (id, payload = {}) => api.patch(`/tasks/${id}/complete`, payload),
  status: (id, status) => api.patch(`/tasks/${id}/status`, { status })
};
