// Middleware de logging mais completo.
// Mantém registro organizado e informativo de cada requisição HTTP.
// Útil para auditoria, diagnóstico e monitoramento da aplicação.

export function logger(req, res, next) {
  const start = Date.now(); // Marca o momento em que a requisição começou

  // Quando a resposta terminar de ser enviada, executa esta função
  res.on("finish", () => {
    const duration = Date.now() - start; // Calcula o tempo total da requisição
    const log = {
      time: new Date().toISOString(), // Data e hora
      method: req.method, // Método HTTP (GET, POST, PUT, DELETE, etc.)
      url: req.originalUrl, // URL completa da rota
      status: res.statusCode, // Código de status retornado
      duration: `${duration}ms`, // Tempo de resposta
      ip: req.ip, // IP do cliente
    };

    // Níveis básicos de log:
    if (res.statusCode >= 500) {
      console.error("❌ [SERVER ERROR]", log);
    } else if (res.statusCode >= 400) {
      console.warn("⚠️ [CLIENT ERROR]", log);
    } else {
      console.log("✅ [REQUEST]", log);
    }
  });

  // Continua o fluxo normal
  next();
}
