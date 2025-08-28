require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

app.get('/health', (req, res) => {
  res.status(200).send('Servidor está funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});