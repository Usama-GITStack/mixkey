let http = require('http');
require("dotenv").config();
let app = require('./config/app');
let server = http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});

// let IO = require('socket.io').listen(server);
// let socket = socketServer(IO);