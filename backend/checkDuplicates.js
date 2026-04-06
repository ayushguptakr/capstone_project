const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/capstone_project').then(async () => {
  const users = await User.find({email: 'dev@ecoquest.edu'});
  console.log(`Found ${users.length} users with email dev@ecoquest.edu`);
  users.forEach((u, i) => console.log(`User ${i}: name=${u.name}, role=${u.role}, id=${u._id}`));
  mongoose.disconnect();
});
