const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect('mongodb://localhost:27017/printshop')
  .then(async () => {
    await Admin.create({
      name: "Admin",
      email: "admin@example.com",
      status: "active",
      password: "admin123", // Replace with a hashed password if you use authentication!
      role: "admin",
      createdAt: { "$date": "2024-06-01T12:00:00Z" }
    });
    console.log('Inserted default admin user.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
