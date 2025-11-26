const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

// Apenas representantes veem avisos financeiros do time
router.get(
  "/team/:teamId",
  verifyFirebaseToken,
  attachUserRole,
  checkRole(["representante_time"]),
  notificationController.listarAvisosDoTimeParaRep
);

module.exports = router;
