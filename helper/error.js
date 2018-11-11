let utils = require('../helper/utils.js');
let error = {};
error.notFound = (res, req) => {
    return res.status(404).json({ "message": req.t("INVALID_REQUEST") });
}
error.notAuthenticated = (res, req, data) => {
    var response = {};
    if (!utils.empty(data) && _.isObject(data)) {
        for (var key in data) {
            response[key] = data[key];
        }
    } else {
        response["message"] = req.t("NOT_AUTHORIZED");
    }
    return res.status(401).json(response);
}
error.validationError = (res, message) => {
    // return res.status(400).json({ "message": message });
    return res.status(400).json(message);
}
error.validationCustomerError = (res, message) => {
    return res.status(400).json(message);
}
error.dbError = (err, req, res) => {
    console.log(err);
    return res.status(500).json({ "message": req.t("DB_ERROR") });
}
module.exports = error;