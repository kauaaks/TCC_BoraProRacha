function logger(req, res, next) {
  const start = Date.now(); 

  
  res.on("finish", () => {
    const duration = Date.now() - start; 
    const log = {
      time: new Date().toISOString(), 
      method: req.method, 
      url: req.originalUrl, 
      status: res.statusCode, 
      duration: `${duration}ms`, 
      ip: req.ip, 
    };

    
    if (res.statusCode >= 500) {
      console.error("[SERVER ERROR]", log);
    } else if (res.statusCode >= 400) {
      console.warn("[CLIENT ERROR]", log);
    } else {
      console.log("[REQUEST]", log);
    }
  });

  next();
}

module.exports = { logger };