let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let userValidator = require('./userValidator');
let userModel = require('./userModel');
let reviewModel = require('./reviewModel');
let eventModel = require('../event/eventModel');
let placeModel = require('../place/placeModel');
const ObjectId = require('mongoose').Types.ObjectId;
let userMiddleware = {};

userMiddleware.validateInput = (type, validateType) => {
    return function(req, res, next) {
        var userValidators = {};
        var validators = userValidator.getUserValidator(req, type);
        userValidators = validators
        var error = _v.validate(req.body, userValidators);
        if (!utils.empty(error)) {
            // return errorUtil.validationError(res, error);
            return errorUtil.validationError(res, { data: [], message: error, status: false });
        }
        next();
    };
}

userMiddleware.emailExists = (req, res, next) => {
    if (!utils.empty(req.body.email)) {
        let userId;
        if (!utils.empty(req.authUser)) {
            userId = req.authUser._id;
        }
        if (req.body.userId) {
            userId = req.body.userId;
        }
        let filter = { email: req.body.email.toLowerCase() };
        if (!utils.empty(userId)) {
            filter._id = { "$ne": userId };
        }
        userModel.getUsers(filter, (err, result) => {
            if (!!result && result.length > 0) {
                res.status(400).json({ status: false, message: req.t("USER_ALREADY_EXISTS", { FIELD: "email" }), data: [] });
            } else {
                next();
            }
        });
    } else {
        next();
    }
}

userMiddleware.usernameExists = (req, res, next) => {
    if (!utils.empty(req.body.userName)) {
        let userId;
        if (!utils.empty(req.authUser)) {
            userId = req.authUser._id;
        }
        if (!utils.empty(req.body.userId)) {
            userId = req.body.userId;
        }
        let filter = { userName: req.body.userName.toLowerCase() };
        if (!utils.empty(userId)) {
            filter._id = { "$ne": userId };
        }
        userModel.getUsers(filter, (err, result) => {
            if (!!result && result.length > 0) {
                res.status(400).json({ status: false, message: req.t("USERNAME_ALREADY_REGISTERED"), data: [] });
            } else {
                next();
            }
        });
    } else {
        next();
    }
}

userMiddleware.checkreviewExist = (req, res, next) => {
    let message = "";
    message = (req.body.eventPlaceType == "event") ? req.t("EVENT_ID_NOT_VALID") : req.t("PLACE_ID_NOT_VALID");
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        let filter = {};
        filter.userId = req.authUser._id;
        if (req.body.eventPlaceType == "event") {
            filter.eventId = req.body.id;
        } else {
            filter.placeId = req.body.id;
        }

        reviewModel.getReview(filter, (err, eventDetails) => {
            if (!utils.empty(err)) {
                console.log(err, 'err')
                return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
            } else if (!utils.empty(eventDetails) && eventDetails.length > 0) {
                return res.status(400).json({ data: [], status: false, "message": req.t("REVIEW_EXIST") });
            } else {
                next();
            }
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": message });
    }
}


userMiddleware.idExists = (req, res, next) => {
    let message = "";
    message = (req.body.eventPlaceType == "event") ? req.t("EVENT_ID_NOT_VALID") : req.t("PLACE_ID_NOT_VALID");
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        if (req.body.eventPlaceType == "event") {
            eventModel.load(req.body.id, (err, eventDetails) => {
                if (!utils.empty(err)) {
                    console.log(err, 'err')
                    return res.status(500).json({ "message": req.t("DB_ERROR") });
                } else if (!utils.empty(eventDetails)) {
                    next();
                } else {
                    return res.status(400).json({ data: [], status: false, "message": message });
                }
            });
        } else {
            placeModel.load(req.body.id, (err, placeDetails) => {
                if (!utils.empty(err)) {
                    console.log(err, 'err')
                    return res.status(500).json({ "message": req.t("DB_ERROR") });
                } else if (!utils.empty(placeDetails)) {
                    next();
                } else {
                    return res.status(400).json({ data: [], status: false, "message": message });
                }
            });
        }
    } else {
        return res.status(400).json({ data: [], status: false, "message": message });
    }
}

userMiddleware.reviewIdExists = (req, res, next) => {
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        next();
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("REVIEW_ID_NOT_VALID") });
    }
}

userMiddleware.userIdExists = (req, res, next) => {
    if (!utils.empty(req.body.userId)) {
        if (ObjectId.isValid(req.body.userId)) {
            userModel.load(req.body.userId, (err, placeDetails) => {
                if (!utils.empty(err)) {
                    console.log(err, 'err')
                    return res.status(500).json({ "message": req.t("DB_ERROR") });
                } else if (!utils.empty(placeDetails)) {
                    next();
                } else {
                    return res.status(400).json({ data: [], status: false, "message": req.t("USER_ID_INVALID") });
                }
            });
        } else {
            return res.status(400).json({ data: [], status: false, "message": req.t("USER_ID_INVALID") });
        }
    } else {
        next();
    }
}

userMiddleware.checkWishlistExist = (req, res, next) => {
    let message = "";
    message = (req.body.eventPlaceType == "event") ? req.t("EVENT_ID_NOT_VALID") : req.t("PLACE_ID_NOT_VALID");
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        let filter = {};
        filter.userId = req.authUser._id;
        if (req.body.eventPlaceType == "event") {
            filter = { "eventWishlist.eventId": req.body.id };
        } else {
            filter = { "placeWishlist.placeId": req.body.id };
        }

        userModel.getUsers(filter, (err, eventDetails) => {
            if (!utils.empty(err)) {
                console.log(err, 'err')
                return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
            } else if (!utils.empty(eventDetails) && eventDetails.length > 0) {
                return res.status(400).json({ data: [], status: false, "message": req.t("WISHLIST_EXIST") });
            } else {
                next();
            }
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": message });
    }
}
userMiddleware.ckeckUserId = (req, res, next) => {
    if (!utils.empty(req.body.userId) && ObjectId.isValid(req.body.userId)) {
        next();
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("USER_ID_INVALID") });
    }
}

module.exports = userMiddleware;