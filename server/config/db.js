const mongoose = require('mongoose');

const connectDB = async () => {
  // En ambiente test, no conectar aquí (se conecta en los tests)
  if (process.env.NODE_ENV === 'test') {
    console.log('⚠️ Modo test: MongoDB se conectará desde los tests');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI no está configurada en variables de entorno');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;