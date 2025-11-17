function checkRole(allowedRoles = []) {
  return async (req, res, next) => {
    const userRole = req.user.role; 

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: `Acesso negado: perfil '${userRole}'` });
    }

    next();
  };
}

module.exports = { checkRole };