let express = require('express');
let bodyParser = require('body-parser');
let app = express.Router();
const path = require('path')
debugger;
app.use('/apidoc', express.static('apidoc'));
app.use('/admin', express.static('admin'));
app.use('/api/v1/user', require('./modules/user/userRoute'));
app.use('/api/v1/event', require('./modules/event/eventRoute'));
app.use('/api/v1/place', require('./modules/place/placeRoute'));
// app.use('/api/v1/category', require('./modules/category/categoryRoute'));
// app.use('/api/v1/banner', require('./modules/banner/bannerRoute'));
// app.get('/admin*', (req, res) => {
//     return res.render('index');(path.join(__dirname, './admin/index.html'));
//     // return res.sendFile('index.html', { root: path.join(__dirname, './admin/') });
// });
app.all('/*', (req, res) => {
    // return res.sendFile(path.join(__dirname, './admin/index.html'));
    return errorUtil.notFound(res, req);
});
module.exports = app;