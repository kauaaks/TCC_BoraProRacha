const express = require("express");
const router = express.Router();

const panelaoController = require("../controllers/panelaoController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.get(
  "/:id",
  verifyFirebaseToken,
  panelaoController.buscarPanelaoPorId
);

router.post(
  "/teams/:teamId",
  verifyFirebaseToken,
  panelaoController.criarPanelao
);

router.get(
  "/teams/:teamId",
  verifyFirebaseToken,
  panelaoController.listarPaneloes
);

// Salvar sorteio
router.patch(
  "/:id/draw",
  verifyFirebaseToken,
  panelaoController.salvarSorteio
);

router.patch(
  "/:id/score",
  verifyFirebaseToken,
  panelaoController.registrarPlacar
);

router.patch(
  "/:id/tournament/match",
  verifyFirebaseToken,
  panelaoController.atualizarPartidaTorneio
);

router.patch(
  "/:id/tournament/finish",
  verifyFirebaseToken,
  panelaoController.finalizarTorneio
);

router.patch(
  "/:id/finish",
  verifyFirebaseToken,
  panelaoController.finalizarPanelao
);

module.exports = router;
