const mongoose = require('mongoose');

const paymentsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teams', required: true },
  month: { type: String, required: true }, 
  amount: { type: Number, default: 0 },
  due_date: { type: Date },
  status: { type: String, enum: ['pending','awaiting_approval','paid','unpaid'], default: 'pending' },
  receipt_url: { type: String, default: null },
  paid_at: { type: Date, default: null },
  confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
  payment_method: { type: String, default: null },
}, { timestamps: true });

paymentsSchema.index({ team_id: 1, user_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Pagamentos', paymentsSchema);
