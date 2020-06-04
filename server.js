let http = require('http');
require("dotenv").config();

// const swaggerUi = require("swagger-ui-express");
// const swaggerJsDoc = require("swagger-jsdoc");

// const swaggerOptions = {
//     swaggerDefinition: {
//         info: {
//             title: "Multikey Api",
//             description: "Swagger UI for api",
//             contact:{
//                 name: "Skylinx Technologies",
//             },
//             servers:["http://localhost:4200"]
//         }
//     },
//     apis: ["server.js"]
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);


let app = require('./config/app');

// app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocs));

let server = http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});

// let IO = require('socket.io').listen(server);
// let socket = socketServer(IO);