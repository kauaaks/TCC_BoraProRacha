const mongoose = require("mongoose");

const gamesSchema = new mongoose.Schema({
  teams_id: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "Times", 
    required: true
  },
  field_id: { 
    type: String, 
    required: true
  },
  scheduled_date: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String, 
    enum: ["pendente", "aceito", "cancelado", "terminado"],
    required: true,
    default: "pendente"
  },
  duration: { 
    type: Number, 
    required: true 
  }, 

  invited_by: { 
    type: String, 
    required: true 
  },
  accepted_by: { 
    type: String, 
    default: null 
  },
  cancelled_by: { 
    type: String, 
    default: null 
  },
  finished_by: { 
    type: [String], 
    default: [] 
  },
  
  goals_team1: { 
    type: Number, 
    default: 0 
  },
  goals_team2: { 
    type: Number, 
    default: 0 
  },
  
  winner_team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Times",
    default: null
  },
  
  place: { 
    type: String 
  }, 
  note: { 
    type: String 
  },
}, { timestamps: true });

module.exports = mongoose.models.Jogos || mongoose.model("Jogos", gamesSchema);
