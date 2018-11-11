const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const eventValidator = require('./eventValidator');
const eventModel = require('./eventModel');
const ObjectId = require('mongoose').Types.ObjectId;
let eventMiddleware = {};

eventMiddleware.validateInput = (type, validateType) => {
    return function(req, res, next) {
        console.log(req.body)
        var eventValidators = {};
        var validators = eventValidator.getEventValidator(req, type);
        eventValidators = validators
        var error = _v.validate(req.body, eventValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


eventMiddleware.titleExists = (req, res, next) => {
    if (!utils.empty(req.body.title)) {
        let filter = { title: req.body.title.toLowerCase() };
        if (!utils.empty(req.body.eventId)) {
            filter._id = { "$ne": req.body.eventId };
        }
        eventModel.getEvents(filter, (err, result) => {
            if (!!result && result.length > 0) {
                res.status(400).json({ status: false, message: req.t("EVENT_TITLE_ALREADY_REGISTERED"), data: [] });
            } else {
                next();
            }
        });
    } else {
        next();
    }
}

eventMiddleware.checkImage = (req, res, next) => {
    if (!utils.empty(req.files) && !utils.empty(req.files.image)) {
        let error = "";
        error = utils.checkValidImageFile(req.files.image, req);
        if (!utils.empty(error)) {
            return res.status(400).json({ data: [], status: false, message: error });
        }
        next();
    } else {
        return res.status(400).json({ data: [], status: false, message: req.t("IMAGE_EMPTY") });
    }
};

eventMiddleware.checkRateReviewExist = (req, res, next) => {
    if (!utils.empty(req.body.eventId) && ObjectId.isValid(req.body.eventId)) {
        let filter = {};
        filter.userId = req.authUser._id;
        filter.eventId = req.body.eventId;

        eventReviewModel.getReview(filter, (err, eventDetails) => {
            if (!utils.empty(err)) {
                console.log(err, 'err')
                return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
            } else if (!utils.empty(eventDetails) && eventDetails.length > 0) {
                return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_REVIEW_EXIST") });
            } else {
                next();
            }
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
    }
}


eventMiddleware.eventIdExists = (req, res, next) => {
    if (!utils.empty(req.body.eventId) && ObjectId.isValid(req.body.eventId)) {
        eventModel.load(req.body.eventId, (err, eventDetails) => {
            if (!utils.empty(err)) {
                console.log(err, 'err')
                return res.status(500).json({ "message": req.t("DB_ERROR") });
            } else if (!utils.empty(eventDetails)) {
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
            }
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
    }
}

eventMiddleware.validateId = (req, res, next) => {
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        next();
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
    }
}

eventMiddleware.checkDate = (req, res, next) => {
    if (!utils.empty(req.body.startDate) && !utils.empty(req.body.endDate)) {
        if (req.body.startDate > req.body.endDate) {
            return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_DATE_NOT_VALID") });
        } else {
            next();
        }
    } else {
        next();
    }
}


module.exports = eventMiddleware;