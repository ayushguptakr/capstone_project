require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(async () => {
  const admin = await User.findOne({email: 'dev@ecoquest.edu'});
  if (admin) {
    admin.role = 'admin';
    admin.password = 'dev123';
    admin.isFirstLogin = false;
    await admin.save();
    console.log('Real backend: Admin role granted and password reset');
  } else {
    await User.create({name: 'Dev Admin', email: 'dev@ecoquest.edu', password: 'dev123', role: 'admin', isFirstLogin: false});
    console.log('Real backend: Admin user created');
  }
  mongoose.disconnect();
}).catch(console.error);
