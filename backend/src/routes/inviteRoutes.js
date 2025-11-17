const express = require("express");
const router = express.Router();


console.log("[inviteRoutes] carregado");
router.use((req, res, next) => {
  console.log("[inviteRoutes] hit:", req.method, req.originalUrl);
  next();
});


const { gerarConvite, entrarNoTime } = require("../controllers/inviteController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");


router.get("/ping", (req, res) => res.json({ ok: true }));


router.post(
  "/gerar",
  verifyFirebaseToken,
  (req, res, next) => {
    if (!req.body || !req.body.timeId) {
      return res.status(400).json({ error: "timeId é obrigatório" });
    }
    next();
  },
  async (req, res, next) => {
    try {
      await gerarConvite(req, res);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/entrar",
  verifyFirebaseToken,
  (req, res, next) => {
    if (!req.body || !req.body.token) {
      return res.status(400).json({ error: "token é obrigatório" });
    }
    next();
  },
  async (req, res, next) => {
    try {
      await entrarNoTime(req, res);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
