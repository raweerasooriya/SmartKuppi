const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    // You can change this password if you want
    const password = 'Admin@123';
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('\n=== Admin Credentials ===');
    console.log('Password:', password);
    console.log('Hashed password:', hash);
    console.log('\nCopy this hashed password to MongoDB:');
    console.log(hash);
    console.log('\n========================\n');
    
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();