const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  timeId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  usado: { type: Boolean, default: false },
  criadoEm: { type: Date, default: Date.now },
  expiraEm: { type: Date } // opcional, ex: 24h depois
});

module.exports = mongoose.model("Invite", inviteSchema);
