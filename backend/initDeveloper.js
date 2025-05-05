const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Developer = require('./models/Developer');

async function createDeveloper() {
  await mongoose.connect('mongodb://localhost:27017/printshop');

  const email = 'appu12345@gmail.com'; // <-- change to your email
  const password = '123456789';  // <-- change to your password
  const name = 'Binosh';               // <-- change to your name

  // Check if developer already exists
  const existing = await Developer.findOne({ email });
  if (existing) {
    console.log('Developer already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Developer.create({
    name,
    email,
    password: hashedPassword,
    status: 'active'
  });

  console.log('Developer created!');
  process.exit(0);
}

createDeveloper().catch(err => {
  console.error(err);
  process.exit(1);
});
