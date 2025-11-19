
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuários", required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: "Times", required: true },

  title: { type: String, required: true },
  message: { type: String, required: true },

  viewed: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.models.Notifications || mongoose.model("Notifications", notificationSchema);
