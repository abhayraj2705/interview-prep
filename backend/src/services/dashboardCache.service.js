const dashboardCache = new Map();
const ttlMs = Number(process.env.DASHBOARD_CACHE_TTL_MS) || 15000;

function keyFor(userId) {
  return String(userId);
}

export function getCachedDashboard(userId) {
  const cached = dashboardCache.get(keyFor(userId));
  if (!cached) return null;
  if (Date.now() - cached.createdAt > ttlMs) {
    dashboardCache.delete(keyFor(userId));
    return null;
  }
  return cached.data;
}

export function setCachedDashboard(userId, data) {
  dashboardCache.set(keyFor(userId), { data, createdAt: Date.now() });
}

export function invalidateDashboardCache(userId) {
  dashboardCache.delete(keyFor(userId));
}
