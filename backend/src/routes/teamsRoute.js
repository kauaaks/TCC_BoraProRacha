const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const teamsController = require("../controllers/teamsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

const shieldsDir = path.join(__dirname, "..", "uploads", "shields");

if (!fs.existsSync(shieldsDir)) {
  fs.mkdirSync(shieldsDir, { recursive: true });
}

const storageShields = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, shieldsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const base = "shield_" + Date.now();
    cb(null, base + ext);
  },
});

const uploadShields = multer({
  storage: storageShields,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Envie apenas imagens"));
    }
    cb(null, true);
  },
});


router.get("/", teamsController.listarTimes);
router.get("/me", verifyFirebaseToken, teamsController.meuTime);
router.get("/meustimes", verifyFirebaseToken, teamsController.meusTimes);
router.get("/:id/members", verifyFirebaseToken, teamsController.listarMembrosTime);

router.put(
  "/:id/escudo",
  verifyFirebaseToken,
  uploadShields.single("escudo"),   
  teamsController.uploadEscudo      
);

router.put(
  "/:id/members/:uid/position",
  verifyFirebaseToken,
  teamsController.atualizarPosicaoMembro
);
router.post("/", verifyFirebaseToken, teamsController.criarTime);
router.put("/:id", verifyFirebaseToken, teamsController.atualizarTime);
router.delete("/:id", verifyFirebaseToken, teamsController.deletarTime);
router.get("/:id/month-range", teamsController.monthRange);
router.get("/:id", teamsController.buscarTime);

module.exports = router;
