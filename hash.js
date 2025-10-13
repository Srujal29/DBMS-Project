const bcrypt = require('bcryptjs');

const password = 'demo123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Hashed Password:', hashedPassword);