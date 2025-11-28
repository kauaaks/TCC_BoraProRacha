const mongoose = require("mongoose");

const panelaoSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Times",
    required: true
  },
  scheduled_date: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String, 
    enum: ["sorteio_pendente", "sorteio_realizado", "terminado"],
    required: true,
    default: "sorteio_pendente"
  },
  duration: { 
    type: Number, 
    required: true 
  }, 

  n_times: { 
    type: Number, 
    min: 2,
    default: 2 
  },
  is_tournament: { 
    type: Boolean, 
    default: false 
  },

  invited_by: { 
    type: String, 
    required: true 
  },
  
  place: { 
    type: String 
  }, 
  note: { 
    type: String 
  },
  
  goals_team1: { 
    type: Number, 
    default: null
  },
  goals_team2: { 
    type: Number, 
    default: null
  },
  winner_squad_index: {
    type: Number,
    default: null
  },

  squads: [{
    name: String,
    color: {
      name: String,
      class: String,
      badge: String,
    },
    players: [{
      id: String,
      name: String,
    }],
  }],
  
  finished_at: { 
    type: Date 
  },

  tournament: {
    format: {
      type: String,
      enum: ["single_elimination", "round_robin"],
      default: "single_elimination"
    },
    matches: [{
      round: String,
      matchNumber: Number,
      team1: {
        squadIndex: Number,
        name: String,
      },
      team2: {
        squadIndex: Number,
        name: String,
      },
      goals_team1: Number,
      goals_team2: Number,
      winner_squadIndex: Number,
      played: {
        type: Boolean,
        default: false
      }
    }],
    champion_squadIndex: Number,
    second_squadIndex: Number,
    third_squadIndex: Number,
  }
}, { 
  timestamps: true 
});

panelaoSchema.index({ team_id: 1, scheduled_date: -1 });
panelaoSchema.index({ status: 1 });

module.exports = mongoose.models.Panelao || mongoose.model("Panelao", panelaoSchema);
