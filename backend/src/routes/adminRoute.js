const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

// Middlewares agrupados para admin
const adminAuth = [
  verifyFirebaseToken,
  attachUserRole,
  checkRole(["admin"]),
];

// GET /admin/teams/finance
router.get(
  "/teams/finance",
  adminAuth,
  adminController.listarTimesFinanceiros
);

// GET /admin/teams/:id/finance
router.get(
  "/teams/:id/finance",
  adminAuth,
  adminController.getTeamFinanceById
);

// POST /admin/teams/:id/notify
router.post(
  "/teams/:id/notify",
  adminAuth,
  adminController.notifyTeam
);

// DELETE /admin/teams/:id
router.delete(
  "/teams/:id",
  adminAuth,
  adminController.deleteTeam
);

module.exports = router;
