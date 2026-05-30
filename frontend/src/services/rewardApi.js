import api from "./api";

export const rewardApi = {
  get: () => api.get("/rewards"),
  badges: () => api.get("/rewards/badges"),
  streak: () => api.get("/rewards/streak")
};
