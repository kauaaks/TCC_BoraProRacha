const admin = require('./src/config/firebase.js'); // ajuste o caminho para seu firebase.js

async function testeCriar() {
  try {
    const user = await admin.auth().createUser({
      email: "teste_unico_email1234@example.com",
      password: "12345678",
    });
    console.log("Usuário criado:", user.uid);
  } catch (err) {
    console.error("Erro:", err);
  }
}

testeCriar();
