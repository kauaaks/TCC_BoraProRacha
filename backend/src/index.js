// 1️⃣ Carrega variáveis de ambiente
require('dotenv').config();

// 2️⃣ Importa dependências
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // logs de requisições
const helmet = require('helmet'); // segurança básica headers

const app = express();

// 3️⃣ Middlewares gerais
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // porta do frontend
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // logs de requisições

// 4️⃣ Rotas de healthcheck
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

// 5️⃣ Importa rotas
const userRoute = require('./routes/userRoute.js');
const teamsRoute = require('./routes/teamsRoute.js');
const gameStatsRoute = require("./routes/game_statsRoute.js");
const gamesRoute = require ("./routes/gamesRoute.js");
const paymentRoute = require ("./routes/paymentsRoute.js")

// 6️⃣ Usa rotas
app.use('/users', userRoute);          // ex: /users, /users/uid/:uid
app.use('/teams', teamsRoute);         // ex: /teams
app.use('/gamestats', gameStatsRoute); // ex: /api/game-stats
app.use('/games', gamesRoute);
app.use('/payments', paymentRoute);

// 7️⃣ Rota raiz
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// 8️⃣ Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    
    // 9️⃣ Inicializa servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// 10️⃣ Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});
