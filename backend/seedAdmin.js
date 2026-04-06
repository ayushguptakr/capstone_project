const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/capstone_project').then(async () => {
  const admin = await User.findOne({email: 'dev@ecoquest.edu'});
  if (admin) {
    admin.password = 'dev123';
    admin.isFirstLogin = false;
    await admin.save();
    console.log('Admin password reset');
  } else {
    await User.create({name: 'Dev Admin', email: 'dev@ecoquest.edu', password: 'dev123', role: 'admin', isFirstLogin: false});
    console.log('Admin user created');
  }
  mongoose.disconnect();
});
