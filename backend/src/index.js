
require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet');
const path = require('path');

const app = express();

app.disable('etag');

const FRONT = process.env.FRONT_ORIGIN || 'http://localhost:5173';


app.use(helmet());


app.use(cors({
  origin: FRONT,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev')); 


app.get('/health', async (req, res) => {
  let dbStatus;
  if (mongoose.connection.readyState === 1) {
    dbStatus = "Conectado";
  } else {
    try {
      await mongoose.connection.db.admin().ping();
      dbStatus = "Conectado";
    } catch (err) {
      dbStatus = "Erro ao conectar";
    }
  }
  res.json({ statusDB: dbStatus });
});


const userRoute = require('./routes/userRoute.js');
const teamsRoute = require('./routes/teamsRoute.js');
const gameStatsRoute = require("./routes/game_statsRoute.js");
const gamesRoute = require ("./routes/gamesRoute.js");
const paymentRoute = require ("./routes/paymentsRoute.js");
const inviteRoutes = require ("./routes/inviteRoutes.js");
const adminRoute = require('./routes/adminRoute');
const teamStatsRoute = require("./routes/teamStatsRoute");
const playerStatsRoute = require("./routes/playerStatsRoute");
const notificationRoute = require("./routes/notificationRoute");
const panelaoRoute = require("./routes/panelaoRoute");
const adminStatsRoute = require("./routes/adminStatsRoute");
const perfilRoute = require("./routes/perfilRoute");

app.use('/users', userRoute);
app.use('/teams', teamsRoute);
app.use('/gamestats', gameStatsRoute);
app.use('/games', gamesRoute);
app.use('/payments', paymentRoute);
console.log("[index] before mount /invite");
app.use('/invite', inviteRoutes);
console.log("[index] after mount /invite");
app.use('/admin', adminRoute);
app.use("/teamstats", teamStatsRoute);
app.use("/playerstats", playerStatsRoute);
app.use("/notifications", notificationRoute);
app.use('/panelao', panelaoRoute);
app.use('/admin', adminStatsRoute);
app.use("/perfil", perfilRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploadsAvatar")));

app.use('/uploads', (req, res, next) => {
  
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  res.setHeader('Access-Control-Allow-Origin', FRONT);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB conectado com sucesso!');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Servidor rodando em http://localhost:${PORT}`);
      console.log(` Uploads servidos em http://localhost:${PORT}/uploads`);
      console.log(` Front permitido: ${FRONT}`);
    });
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));


app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});
