function errorHandler(err, req, res, next) {
  console.error("[ERROR HANDLER]", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  
  const status = err.statusCode || 500;

  
  const response = {
    success: false,
    message:
      status === 500
        ? "Erro interno do servidor. Tente novamente mais tarde."
        : err.message,
  };

 
  res.status(status).json(response);
}

module.exports = { errorHandler };