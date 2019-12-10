let mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_skylinxtech:ayKXVmyd8ZdNeb@ds053529.mlab.com:53529/heroku_r9hh0p1k');

mongoose.connection.on('error', function(err) {
    console.log(err);
    console.log("Could not connect server....");
});
