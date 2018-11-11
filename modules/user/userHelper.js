let jwt = require('../../helper/jwt');
let utils = require('../../helper/utils');
let userUtil = {}

userUtil.userDetail = (data, selectData) => {
    let user = {};
    if (utils.empty(selectData)) {
        selectData = ["_id", "fullName", "email", "imagePath", "fullName"];
    }
    let fieldsIn = ["role"];
    _(selectData).forEach((val) => {
        let customData = false;
        if (fieldsIn.indexOf(val) >= 0) {
            customData = {};
            _(data[val]).forEach((val1, key1) => {
                if (selectData.indexOf(key1) >= 0)
                    customData[key1] = val1;
            });
        }
        if (customData !== false) {
            user[val] = customData;
        } else {
            user[val] = data[val];
        }
    });
    delete user["roleId"];
    // delete user["countryId"];
    return user;
};

userUtil.sendWelcomeEmail = (userData) => {
    let welcomeContentPath = "./mail_content/welcome.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        console.log(userData);
        console.log(userData.email);
        console.log('userData.email');
        let subject = "Welcome to ScriptBin";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        let encData = utils.dataEncrypt('{"userId":' + userData.id + ',"date":"' + now_utc + '"}');
        if (!utils.empty(userData.fullName)) {
            content = content.replace("{NAME}", utils.capitalizeFirstLetter(userData.fullName));
        } else {
            content = content.replace("{NAME}", "");
        }
        content = content.replace("{USERNAME}", userData.email);
        let _password = '';
        if (!utils.empty(userData.password)) {
            _password = utils.dataDecrypt(userData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        // content = content.replace("{VERIFY_LINK}", process.env.SITE_URL + '/setPassword/' + encData + '?type=systemUser');
        utils.sendEmail(userData.email, subject, content, (error, data) => {
            console.log('error>>>', error);
            console.log('data>>>', data)
        });
    });
};

userUtil.sendInviteEmail = (userData, loginUser) => {
    let welcomeContentPath = "./mail_content/invite.html";
    utils.getHtmlContent(welcomeContentPath, (err, content) => {
        console.log(userData);
        console.log(userData.email);
        console.log('userData.email');
        let subject = "Invite to ScriptBin";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        let encData = utils.dataEncrypt('{"userId":' + userData.id + ',"date":"' + now_utc + '"}');
        if (!utils.empty(userData.fullName)) {
            content = content.replace("{NAME}", utils.capitalizeFirstLetter(userData.fullName));
        } else {
            content = content.replace("{NAME}", "");
        }
        content = content.replace("{USERNAME}", userData.email);
        content = content.replace("{INVITEUSERNAME}", utils.capitalizeFirstLetter(loginUser.fullName));
        let _password = '';
        if (!utils.empty(userData.password)) {
            _password = utils.dataDecrypt(userData.password);
        }
        content = content.replace("{PASSWORD}", _password);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        // content = content.replace("{VERIFY_LINK}", process.env.SITE_URL + '/setPassword/' + encData + '?type=systemUser');
        utils.sendEmail(userData.email, subject, content, (error, data) => {
            console.log('error>>>', error);
            console.log('data>>>', data)
        });
    });
};
userUtil.sendForgotPasswordEmail = (user, pass, cb) => {
    let forgotPasswordContentPath = "./mail_content/forgot_password.html";
    utils.getHtmlContent(forgotPasswordContentPath, (err, content) => {
        let subject = "Forgot Password";
        let now = new Date();
        if (!utils.empty(user.fullName)) {
            content = content.replace("{NAME}", utils.capitalizeFirstLetter(user.fullName));
        } else {
            content = content.replace("{NAME}", "");
        }
        content = content.replace("{PASSWORD}", pass);
        content = content.replace("{USERNAME}", user.email);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.BASE_URL);
        utils.sendEmail(user.email, subject, content, cb);
    });
};

userUtil.sendVerifyEmail = (user, cb) => {
    let verifyContentPath = "./mail_content/verify_email.html";
    utils.getHtmlContent(verifyContentPath, (err, content) => {
        let subject = "Verification Email";
        let now = new Date();
        let now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        let encData = utils.dataEncrypt('{"userId":' + user.userId + ',"date":"' + now_utc + '","email":"' + user.email + '"}');
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(user.fullName));
        content = content.replace("{LINK}", process.env.SITE_URL + "/verify/" + encData);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.SITE_URL);
        utils.sendEmail(user.email, subject, content, cb);
    });
};

userUtil.sendContactEmail = (user, cb) => {
    let contactContentPath = "./mail_content/contact.html";
    utils.getHtmlContent(contactContentPath, (err, content) => {
        let subject = "Inquire";
        content = content.replace("{EMAIL}", user.email);
        content = content.replace("{NAME}", utils.capitalizeFirstLetter(user.name));
        content = content.replace("{COMMENTS}", user.comments);
        content = content.replace(new RegExp("{BASEPATH}", 'g'), process.env.SITE_URL);
        utils.sendEmail(config.CONTACT_EMAIL, subject, content, user.email, cb);
    });
    // cb(null, true);
};

userUtil.saveUserProfilePicture = (file, cb) => {
    if (!utils.empty(file) && !utils.empty(file.profilePic) && file.profilePic) {
        utils.uploadImage([file.profilePic], config.USER_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

userUtil.saveUserProfilePictureByUrl = (file, cb) => {
    if (!utils.empty(file)) {
        utils.uploadImage([file], config.USER_IMAGE_PATH, "files", cb);
    } else {
        cb({ "data": [], "error": "" });
    }
};

userUtil.getActualImagePath = (profilePic) => {
    let imagePath = undefined;
    if (!utils.empty(profilePic))
    // imagePath = process.env.SITE_URL + config.USER_IMAGE_PATH + profilePic;
        imagePath = process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_IMAGE_PATH + profilePic;
    return imagePath;
};

userUtil.getActualImagePathWithoutImage = () => {
    return process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_IMAGE_PATH;
}

userUtil.getActualThumbImagePath = (thumb) => {
    let thumbPath = undefined;
    if (!utils.empty(thumb))
        thumbPath = process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_THUMB_IMAGE_PATH + thumb;
    return thumbPath;
};

userUtil.getActualThumbPathWithoutThumb = () => {
    return process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_THUMB_IMAGE_PATH;
};

userUtil.getOriginalImagePath = (image) => {
    let thumbPath = undefined;
    if (!utils.empty(image))
        thumbPath = process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_FULL_IMAGE_PATH + image;
    return thumbPath;
};

userUtil.getOriginalPathWithoutImage = () => {
    return process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/' + config.USER_FULL_IMAGE_PATH;
};


module.exports = userUtil