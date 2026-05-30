import api from "./api";

export const roadmapApi = {
  generate: (payload) => api.post("/roadmaps/generate", payload),
  list: () => api.get("/roadmaps"),
  get: (id) => api.get(`/roadmaps/${id}`),
  update: (id, payload) => api.patch(`/roadmaps/${id}`, payload),
  remove: (id) => api.delete(`/roadmaps/${id}`),
  activate: (id) => api.post(`/roadmaps/${id}/activate`),
  convertToTasks: (id, payload) => api.post(`/roadmaps/${id}/convert-to-tasks`, payload)
};
