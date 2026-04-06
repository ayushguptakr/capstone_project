const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/capstone_project').then(async () => {
  const admin = await User.findOne({email: 'dev@ecoquest.edu'});
  if (admin) {
    console.log('Role:', admin.role);
    Object.assign(admin, { role: 'admin' });
    await admin.save();
    console.log('Re-saved to ensure admin role is "admin"');
  } else {
    console.log('Admin not found');
  }
  mongoose.disconnect();
});
