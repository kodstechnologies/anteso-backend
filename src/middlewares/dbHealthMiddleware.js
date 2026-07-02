import { ensureDbConnection, getDbStatus, isDbConnected } from '../db/index.js';

const HEALTH_PATHS = new Set(['/health', '/anteso/health']);

const isHealthCheckRequest = (req) =>
  HEALTH_PATHS.has(req.path) || HEALTH_PATHS.has(req.originalUrl);

const dbHealthMiddleware = async (req, res, next) => {
  if (isHealthCheckRequest(req)) {
    return next();
  }

  if (isDbConnected()) {
    return next();
  }

  const connected = await ensureDbConnection(8000);

  if (!connected) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again in a few seconds.',
      dbStatus: getDbStatus(),
    });
  }

  return next();
};

export default dbHealthMiddleware;
