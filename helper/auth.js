let utils = require('../helper/utils');
let jwt = require('../helper/jwt');
let userModel = require('../modules/user/userModel');
// let customerModel = require('../modules/customer/customerModel');
const userTokenModel = require('../modules/user/userTokenModel');
let auth = {};

auth.checkToken = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['x-auth-token']);
    }
    if (utils.empty(token)) {
        return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
    req.token = token;
    next();
}

auth.isAuthenticatedUser = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['x-auth-token']);
    }
    let userData = jwt.decodeToken(token);
    let condition = { token: token }
    condition.userId = userData.uid;
    userTokenModel.loadData(condition, (err, tokenData) => {
        if (!utils.empty(tokenData) && tokenData.length > 0) {
            if (utils.empty(userData.uid)) {
                return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
            } else {
                userModel.getUserById(userData.uid, (err, user) => {
                    if (user) {
                        req.authUser = user;
                        req.authUserInstallationId = userData.installationId;
                        req.userRole = user.userRole;
                        next();
                    } else {
                        return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
                    }
                });
            }
        } else {
            return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
        }
    });
}

auth.isAuthenticatedCustomer = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['x-auth-token']);
    }
    let userData = jwt.decodeToken(token);
    console.log(userData)
    if (!utils.empty(userData) && !utils.empty(userData.uid)) {
        let condition = { token: token }
        condition.customerId = userData.uid;
        userTokenModel.loadData(condition, (tokenData) => {
            if (!utils.empty(tokenData) && tokenData.length > 0) {
                if (utils.empty(userData.uid)) {
                    return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
                } else {
                    customerModel.getCustomerById(userData.uid, (user) => {
                        if (user) {
                            req.authUser = user;
                            req.authUserInstallationId = userData.installationId;
                            next();
                        } else {
                            return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
                        }
                    });
                }
            } else {
                return res.status(400).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
            }
        });
    } else {
        next();
    }
}

auth.isVerified = (req, res, next) => {
    if (!Boolean(req.authUser.isVerified)) {
        return res.status(400).send(req.t("NOT_VERIFIED"));
    }
    next();
}

auth.verifyHash = (req, res, next) => {
    if ("params" in req && "hash" in req.params) {
        if (utils.empty(req.params.hash))
            return res.status(400).send(req.t("HASH_NOT_FOUND"));
        else {
            try {
                var decryptedHash = utils.dataDecrypt(req.params.hash);
                req.decryptedHash = decryptedHash;
            } catch (ex) {
                return res.status(400).send(req.t("INVALID_HASH"));
            }
        }
    }
    next();
}

auth.hasPermission = (permissionName) => {
    return (req, res, next) => {
        if (!utils.empty(req.role)) {
            rolePermission.hasPermission(req.role, permissionName, (data) => {
                if (utils.empty(data)) {
                    return res.status(400).send(req.t("NOT_AUTHORIZED"));
                } else {
                    next();
                }
            }, (err) => {
                console.log(err);
                return res.status(500).send(req.t("DB_ERROR"));
            });
        } else {
            return res.status(400).send(req.t("NOT_AUTHORIZED"));
        }
    }
}
module.exports = auth