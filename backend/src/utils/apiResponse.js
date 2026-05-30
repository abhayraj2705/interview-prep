export function successResponse(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function errorResponse(res, message, statusCode = 500, data = {}) {
  return res.status(statusCode).json({ success: false, message, data });
}
