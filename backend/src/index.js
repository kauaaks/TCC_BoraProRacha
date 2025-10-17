// 1️ Carrega variáveis de ambiente
require('dotenv').config();

// 2️⃣ Importa dependências
const express = require('express');
const mongoose = require('mongoose');

// 3️⃣ Cria app Express
const app = express();

app.get('/health', async (req, res) => {
  let dbStatus;

  // Verifica estado da conexão do Mongoose
  if (mongoose.connection.readyState === 1) {
    dbStatus = "Conectado";
  } else {
    try {
      // Tenta "pingar" o banco
      await mongoose.connection.db.admin().ping();
      dbStatus = "Conectado";
    } catch (err) {
      dbStatus = "Erro ao conectar";
    }
  }

  res.json({ statusDB: dbStatus });
});

// 4️⃣ Middleware para ler JSON no corpo das requisições
app.use(express.json());

// 5️⃣ Importa as rotas
const userRoute = require('./routes/userRoute.js');
const teamsRoute = require('./routes/teamsRoute.js');

// 6️⃣ Usa as rotas (define caminhos base)
app.use('/users', userRoute);
app.use('/teams', teamsRoute);

// 7️⃣ Rota inicial de teste (só pra confirmar que está rodando)
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// 8️⃣ Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
  // 9️⃣ Define porta e inicia o servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));


