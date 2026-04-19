const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
        const field = err.meta?.target ? err.meta.target.join(', ') : 'Field';
        message = `${field} already exists or is duplicated`;
        statusCode = 400;
    }

    // Prisma Record Not Found
    if (err.code === 'P2025') {
        message = 'Record not found';
        statusCode = 404;
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
