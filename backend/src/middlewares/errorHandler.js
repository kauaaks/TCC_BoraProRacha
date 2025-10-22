// Middleware centralizado de tratamento de erros.
// Intercepta erros lançados em qualquer rota ou middleware anterior.

function errorHandler(err, req, res, next) {
  console.error("🔥 [ERROR HANDLER]", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  // Define código padrão
  const status = err.statusCode || 500;

  // Mensagem padrão para o cliente (nunca exponha erros sensíveis)
  const response = {
    success: false,
    message:
      status === 500
        ? "Erro interno do servidor. Tente novamente mais tarde."
        : err.message,
  };

  // Envia resposta JSON padronizada
  res.status(status).json(response);
}

module.exports = { errorHandler };