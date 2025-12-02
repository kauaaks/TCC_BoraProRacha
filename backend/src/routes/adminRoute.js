const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

const adminAuth = [verifyFirebaseToken, attachUserRole, checkRole(["admin"])];

router.get(
  "/teams/finance",
  adminAuth,
  adminController.listarTimesFinanceiros
);

router.get(
  "/teams/:id/finance",
  adminAuth,
  adminController.getTeamFinanceById
);

router.post(
  "/teams/:id/notify",
  adminAuth,
  adminController.notifyTeam
);

router.delete(
  "/teams/:id",
  adminAuth,
  adminController.deleteTeam
);

router.post(
  "/users",
  adminAuth,
  adminController.criarUsuarioAdmin
);

module.exports = router;
