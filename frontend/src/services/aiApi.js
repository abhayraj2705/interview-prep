import api from "./api";

export const aiApi = {
  dailySuggestions: () => api.post("/ai/daily-suggestions"),
  questionnaire: (payload) => api.post("/ai/questionnaire", payload),
  weakness: () => api.post("/ai/analyze-weakness")
};
