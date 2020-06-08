// global.mysql = require('mysql');
global._ = require("lodash")
global.errorUtil = require('../helper/error');
global.config = require('../config/config');
let database = require('../config/database');
global.l10n = require('jm-ez-l10n');
l10n.setTranslationsFile('en', './language/translation.en.json');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.set('port', process.env.PORT);
app.use(l10n.enableL10NExpress);

app.use(bodyParser.urlencoded({ limit: '1gb' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '1gb' }));
app.use(express.static('./apidoc'));
app.use('/uploads', express.static('./uploads'));
app.use('/images', express.static('./images'));
app.use('/admin', express.static('./admin'));

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Request-Headers", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept,Access-Control-Allow-Headers,x-auth-token,x-l10n-locale");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

app.use(require('../route'));
// let db = require("./database");
// let user = require('../modules/user/userModel');
// db.sequelize.sync().then(() => {});
// db.sequelize.sync({ force: true }).then(() => {
//     user.create({ fullName: 'Vashram Berani', email: 'scriptbin@gmail.com', password: 'scriptbin..123', mobileNo: '9016981221', verified: 1, "status": "ACTIVE", "userRole": 1 });
// });


module.exports = app;

