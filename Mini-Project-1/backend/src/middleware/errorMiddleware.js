// Global Error Handling Middleware

// 1. NotFound Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 2. Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Database Conflict: A record with this unique value already exists.';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Database Integrity Violation: Referenced record does not exist.';
        break;
      case '22P02': // Invalid text representation (e.g. string to int)
        statusCode = 400;
        message = 'Database Error: Invalid data type format provided.';
        break;
      default:
        statusCode = 500;
        message = `Database Error: ${err.message}`;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
