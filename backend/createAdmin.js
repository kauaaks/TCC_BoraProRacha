const admin = require("firebase-admin");
const mongoose = require("mongoose");

const User = require("./src/models/user");

const serviceAccount = require("./src/config/firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const MONGO_URL =
  "mongodb+srv://willianalves4998_db_user:123@cluster0.epmh9si.mongodb.net/?appName=Cluster0";

async function createAdmin() {
  try {
    console.log("Conectando ao MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("Conectado ao MongoDB.");

    console.log("Criando usuário admin no Firebase Auth...");

    const firebaseUser = await admin.auth().createUser({
      email: "adminInsano1@gmail.com",
      password: "admin234",
      displayName: "Administrador",
    });

    console.log("Firebase Admin criado com UID:", firebaseUser.uid);

    console.log("Salvando usuário admin no MongoDB...");

    const novoUsuario = await User.create({
      nome: "Administrador",
      telefone: "000000000",
      ativo: true,
      user_type: "admin",
      firebaseUid: firebaseUser.uid,
    });

    console.log("Usuário admin salvo no MongoDB:");
    console.log(novoUsuario);

    console.log("Finalizado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("ERRO:", err);
    process.exit(1);
  }
}

createAdmin();
