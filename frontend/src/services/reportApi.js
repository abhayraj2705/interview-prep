import api from "./api";

export const reportApi = {
  dashboard: () => api.get("/reports/dashboard"),
  daily: () => api.get("/reports/daily"),
  weekly: () => api.get("/reports/weekly"),
  generateDaily: () => api.post("/reports/generate-daily"),
  generateWeekly: () => api.post("/reports/generate-weekly")
};
