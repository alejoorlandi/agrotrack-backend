const bcrypt = require('bcrypt');
const { User } = require('./models');

async function createAdmin() {
  try {
    const exists = await User.findOne({ where: { email: 'admin@test.com' } });
    if (exists) {
      console.log('⚠️ El usuario ya existe.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    
    // CAMBIO AQUÍ: Usamos password_hash en lugar de password
    await User.create({
      email: 'admin@test.com',
      password_hash: hashedPassword, 
      role: 'admin'
    });

    console.log('✅ Usuario administrador creado con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();