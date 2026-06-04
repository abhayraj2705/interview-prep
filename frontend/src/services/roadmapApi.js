import api from "./api";

export const roadmapApi = {
  generate: (payload) => api.post("/roadmaps/generate", payload),
  generateAsync: (payload) => api.post("/roadmaps/generate-async", payload),
  generationJob: (id) => api.get(`/roadmaps/generation-jobs/${id}`),
  list: () => api.get("/roadmaps"),
  get: (id) => api.get(`/roadmaps/${id}`),
  update: (id, payload) => api.patch(`/roadmaps/${id}`, payload),
  remove: (id) => api.delete(`/roadmaps/${id}`),
  removeAll: () => api.delete("/roadmaps"),
  activate: (id) => api.post(`/roadmaps/${id}/activate`),
  convertToTasks: (id, payload) => api.post(`/roadmaps/${id}/convert-to-tasks`, payload)
};
