import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  logger.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);

  // Safe client error message
  let clientMessage = err.message || 'Internal server error';

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    clientMessage = 'An unexpected error occurred on the server. Please try again later.';
  }

  // Handle common status codes
  if (err.name === 'UnauthorizedError' || statusCode === 401) {
    return errorResponse(res, 'Authentication failed. Please log in again.', 401);
  }

  if (statusCode === 403) {
    return errorResponse(res, 'Access denied. You do not have permission for this resource.', 403);
  }

  if (statusCode === 409 || err.code === '23505') { // Postgres unique violation
    return errorResponse(res, 'A record with this information already exists.', 409);
  }

  if (statusCode === 429) {
    return errorResponse(res, 'Too many requests. Please slow down.', 429);
  }

  return errorResponse(res, clientMessage, statusCode, err.errors || null);
};
