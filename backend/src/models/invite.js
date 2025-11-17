const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    timeId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    usado: { type: Boolean, default: false },
    criadoEm: { type: Date, default: Date.now },
    expiraEm: { type: Date } 
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);


inviteSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiraEm: { $type: "date" } } });


inviteSchema.pre("save", function (next) {
  if (this.expiraEm && this.expiraEm <= new Date()) {
    return next(new Error("expiraEm deve ser uma data futura"));
  }
  next();
});

module.exports = mongoose.model("Invite", inviteSchema);
