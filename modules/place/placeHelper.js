let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let placeUtil = {}

placeUtil.saveplacePicture = (file, cb) => {
    if (!utils.empty(file) && !utils.empty(file.image) && file.image) {
        utils.uploadImage([file.image], config.PLACE_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

placeUtil.savEplaceImageByUrl = (file, cb) => {
    if (!utils.empty(file)) {
        utils.uploadImage([file], config.PLACE_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

placeUtil.getActualImagePath = (profilePic) => {
    let imagePath = undefined;
    if (!utils.empty(profilePic))
    // imagePath = process.env.SITE_URL + config.PLACE_IMAGE_PATH + profilePic;
        imagePath = process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.PLACE_IMAGE_PATH + profilePic;
    return imagePath;
};

module.exports = placeUtil