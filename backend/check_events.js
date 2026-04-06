const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const Event = require('./models/Event');
      const User = require('./models/User');
      
      const events = await Event.find({});
      console.log('--- ALL EVENTS ---');
      console.log(events.length);

      const principals = await User.find({ role: 'principal' }).select('name email school schoolId status');
      console.log('\n--- PRINCIPALS ---');
      console.log(JSON.stringify(principals, null, 2));

    } catch (err) {
      console.error(err);
    } finally {
      mongoose.disconnect();
    }
  });
