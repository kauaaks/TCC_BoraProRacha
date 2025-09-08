const mongoose= require("mongoose");
require("dotenv").config();

async function  connectDB() {
    try {
        await mongoose.connect(ProcessingInstruction.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedtopology: true,
        });
        console.log("Banco conectado.");
    } catch (error){
        console.error("erro na conexão com o banco:", error);
        process.exit(1);
    }
}

module.exports = connectDB;