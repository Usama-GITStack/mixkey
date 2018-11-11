let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let eventUtil = {}

eventUtil.saveEventPicture = (file, cb) => {
    if (!utils.empty(file) && !utils.empty(file.image) && file.image) {
        utils.uploadImage([file.image], config.EVENT_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

eventUtil.savEeventImageByUrl = (file, cb) => {
    if (!utils.empty(file)) {
        utils.uploadImage([file], config.event_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

eventUtil.getActualImagePath = (profilePic) => {
    let imagePath = undefined;
    if (!utils.empty(profilePic))
    // imagePath = process.env.SITE_URL + config.event_IMAGE_PATH + profilePic;
        imagePath = process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.event_IMAGE_PATH + profilePic;
    return imagePath;
};

module.exports = eventUtil