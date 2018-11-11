let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let placeValidator = require('./placeValidator');
let placeModel = require('./placeModel');
const ObjectId = require('mongoose').Types.ObjectId;
let placeMiddleware = {};

placeMiddleware.validateInput = (type, validateType) => {
    return function(req, res, next) {
        console.log(req.body)
        var placeValidators = {};
        var validators = placeValidator.getPlaceValidator(req, type);
        placeValidators = validators
        var error = _v.validate(req.body, placeValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


placeMiddleware.placeNameExists = (req, res, next) => {
    if (!utils.empty(req.body.placeName)) {
        let filter = { placeName: req.body.placeName.toLowerCase() };
        if (!utils.empty(req.body.placeId)) {
            filter._id = { "$ne": req.body.placeId };
        }
        placeModel.getPlaces(filter, (err, result) => {
            if (!!result && result.length > 0) {
                res.status(400).json({ status: false, message: req.t("PLACE_NAME_EXIST"), data: [] });
            } else {
                next();
            }
        });
    } else {
        next();
    }
}

placeMiddleware.checkImage = (req, res, next) => {
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

placeMiddleware.validateId = (req, res, next) => {
    if (!utils.empty(req.body.id) && ObjectId.isValid(req.body.id)) {
        next();
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("PLACE_ID_NOT_VALID") });
    }
}

module.exports = placeMiddleware;