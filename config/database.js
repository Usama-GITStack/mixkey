let mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

mongoose.connection.on('error', function(err) {
    console.log(err);
    console.log("Could not connect server....");
});
