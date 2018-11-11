const jwt = require('../../helper/jwt');
const userModel = require('./userModel');
const installationModel = require('./installationModel');
const reviewModel = require('./reviewModel');
const utils = require('../../helper/utils');
const userUtil = require('./userHelper');
const waterfall = require('async-waterfall');
const fs = require('fs');
const userTokenModel = require('./userTokenModel');
const notificationUtils = require('../../helper/notificationUtils');
const messageModel = require('./messageModel');
const wishlistModel = require('./wishlistModel');
const placeModel = require('../place/placeModel');
const eventModel = require('../event/eventModel');
const ObjectId = require('mongoose').Types.ObjectId;

let userCtr = {};

userCtr.getFields = (type) => {
    let common = [
        "_id",
        "fullName",
        "email",
        "userName",
        "userRole",
        "gender",
        "age",
        "country",
        "lastLogin",
        "status",
        "profilePic",
        "userBio",
        "practiceLanguage",
        "nativeLanguage",
        "isActive",
        "createdAt",
        "praticeLangCode",
        "nativeLangCode",
        "imagePath"
    ];
    switch (type) {
        case "login":
            common = common.concat(["secretToken"]);
        case "profile":
            common = common.concat([
                "superAdmin",
                "lastLogin",
            ]);
            break;
    }
    return common;
};

userCtr.login = (req, res) => {
    let input = req.body;
    let filter = {};
    filter["$or"] = [{
            "email": input.email.toLowerCase()
        },
        {
            "userName": input.email.toLowerCase()
        }
    ];
    if ("socialId" in input) {
        filter["$or"].push({
            "socialId": input.socialId
        });
    }
    let select = userCtr.getFields('login');
    select = select.concat(["password"]);
    userModel.getUserLogin(filter, select, (err, userData) => {
        if (!!err) {
            return res.status(500).json({
                data: [],
                status: false,
                message: req.t("DB_ERROR")
            });
        } else if (!utils.empty(userData) && userData.length > 0) {
            let user = userData[0];
            if (!("socialId" in input) && !user.authenticate(input.password)) {
                return res.status(400).json({
                    data: [],
                    status: false,
                    "message": req.t("PASSWORD_NOT_FOUND")
                });
            } else {
                let selectFields = userCtr.getFields("login");
                if (!utils.empty(user.status) && user.status === "INACTIVE") {
                    return res.status(400).json({
                        data: [],
                        status: false,
                        "message": req.t("INACTIVE_ACCOUNT")
                    });
                } else {
                    let randomString = utils.getRandomString(2);
                    let tokenData = {
                        uid: user._id,
                        email: user.email,
                        userRole: user.userRole,
                        randomString: randomString
                    };
                    if (!utils.empty(input.installationId)) {
                        installationModel.setUserInstallation(input.installationId, user.userId, (installationResult) => {});
                        tokenData = _.extend(tokenData, {
                            "installationId": parseInt(input.installationId)
                        });
                    }
                    let responseData = userUtil.userDetail(user, selectFields);
                    responseData["secretToken"] = jwt.createSecretToken(tokenData);

                    user.lastLogin = Date.now();
                    user.isActive = true;
                    user.save((err) => {
                        console.log(err, 'update lastlogin')
                    });
                    let response = {
                        "data": responseData,
                        "status": true,
                        "message": req.t('LOGIN_SUCCESSFUL')
                    }

                    let userTokenObject = new userTokenModel({
                        userId: responseData._id,
                        token: responseData.secretToken
                    });
                    userTokenObject.save((err) => {
                        if (utils.empty(err)) {
                            return res.status(200).json(response);
                        } else {
                            return res.status(500).json({
                                data: [],
                                status: false,
                                message: req.t("DB_ERROR")
                            });
                        }
                    });
                }
            }
        } else {
            res.status(400).json({
                "message": req.t("NOT_VALID_EMAIL_PASSWORD"),
                status: false,
                data: []
            });
        }
    });
};

userCtr.socialLogin = (req, res) => {
    let input = req.body;
    userModel.getUserByEmail(input.email.toLowerCase(), (err, userData) => {
        if (!utils.empty(userData) && userData.length > 0) {
            userModel.update({
                email: input.email
            }, {
                socialId: input.socialId
            }, (err, updateData) => {
                if (!utils.empty(updateData)) {
                    userCtr.login(req, res);
                } else {
                    return res.status(500).send(req.t("DB_ERROR"));
                }
            });
        } else {
            userCtr.addUser(req, res, (success, error) => {
                if (error) {
                    return res.status(500).json({
                        "message": error
                    });
                } else {
                    return res.status(200).json(success);
                }
            });
        }
    });
}

userCtr.getProfile = (req, res) => {
    let loginUser = req.authUser;
    let userId;
    if (!utils.empty(loginUser)) {
        userId = loginUser._id;
    }
    if (req.body.userId) {
        userId = req.body.userId;
    }
    let select = userCtr.getFields('login');
    userModel.load(userId, select, (err, userDetail) => {
        if (!!err) {
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            let response = {
                "message": "",
                data: userDetail,
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

userCtr.addUser = (req, res, cb) => {

    let input = req.body;
    let loginUser = req.authUser;
    let selectFields = userCtr.getFields("login");
    waterfall([
            (callback) => {
                if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
                    userUtil.saveUserProfilePicture(req.files, (result) => {
                        if (!utils.empty(result.error)) {
                            callback(result.error, "");
                        } else {
                            callback(null, result.data[0]);
                        }
                    });
                    // utils.uploadImageInServer(req.files.profilePic, config.USER_IMAGE_PATH, '', (err, imageName) => {
                    //     console.log(err, 'image upload')
                    //     callback(null, imageName);
                    // });
                } else if (!utils.empty(input.profilePic)) {
                    userUtil.saveUserProfilePictureByUrl(input.profilePic, (result) => {
                        if (!utils.empty(result.error)) {
                            callback(result.error, "");
                        } else {
                            callback(null, result.data[0]);
                        }
                    });
                } else {
                    callback(null, null);
                }
            },
            (image, callback) => {
                let userData = {
                    email: input.email.toLowerCase(),
                    userName: input.userName.toLowerCase(),
                    password: input.password,
                    gender: input.gender,
                    age: input.age,
                    isActive: true,
                    lastLogin: Date.now(),
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    loc: {
                        type: "Point",
                        coordinates: [config.long, config.late]
                    }
                };
                if (utils.empty(input.userName)) {
                    userData.userName = input.email.toLowerCase();
                }
                if (!utils.empty(input.fullName)) {
                    userData.fullName = input.fullName;
                }
                if (!utils.empty(input.country)) {
                    userData.country = input.country;
                }
                if (!utils.empty(input.userBio)) {
                    userData.userBio = input.userBio;
                }
                if (!utils.empty(input.nativeLanguage)) {
                    userData.nativeLanguage = input.nativeLanguage;
                }
                if (!utils.empty(input.socialId)) {
                    userData.socialId = input.socialId;
                }
                if (!utils.empty(image)) {
                    userData.profilePic = image;
                }
                if (!utils.empty(input.nativeLangCode)) {
                    userData.nativeLangCode = input.nativeLangCode;
                }
                if (!utils.empty(input.praticeLangCode)) {
                    userData.praticeLangCode = input.praticeLangCode;
                }

                let languageArr = [];
                if (!!input.practiceLanguage && input.practiceLanguage.length > 0 && typeof input.practiceLanguage === 'object') {
                    input.practiceLanguage.map((obj) => {
                        languageArr.push({ language: obj });
                    });
                }
                userData.practiceLanguage = languageArr;

                var userObject = new userModel(userData);
                userObject.save((err) => {
                    if (utils.isDefined(err)) {
                        callback(err);
                    } else {
                        callback(null, userObject);
                    }
                });
            }
        ],
        (err, userDetails) => {
            if (!utils.empty(err)) {
                if (err == 'USER_ALREADY_EXISTS') {
                    cb(null, req.t("USER_ALREADY_EXISTS", {
                        FIELD: "email"
                    }));
                } else {
                    cb(null, req.t("DB_ERROR"));
                }
            } else {

                let randomString = utils.getRandomString(2);
                let tokenData = {
                    uid: userDetails._id,
                    email: userDetails.email,
                    userRole: userDetails.userRole,
                    randomString: randomString
                };
                if (!utils.empty(req.body.installationId)) {
                    tokenData = _.extend(tokenData, {
                        "installationId": parseInt(req.body.installationId)
                    });
                }
                userDetails["secretToken"] = jwt.createSecretToken(tokenData);

                // if (invite === 'invite') {
                //     userUtil.sendInviteEmail(userDetailsJson, loginUser);
                // } else {
                //     userUtil.sendWelcomeEmail(userDetailsJson);
                // }
                userDetails = userUtil.userDetail(userDetails, selectFields);
                userDetails["secretToken"] = jwt.createSecretToken(tokenData);
                let response = {
                    "data": userDetails,
                    "status": true,
                    "message": req.t("USER_REGISTERED")
                }
                let userTokenObject = new userTokenModel({
                    userId: userDetails._id,
                    token: userDetails.secretToken
                });
                userTokenObject.save((err) => {
                    if (utils.isDefined(err)) {
                        cb(null, err);
                    } else {
                        cb(response, null);
                    }
                });
            }
        });
}

userCtr.createUser = (req, res) => {
    userCtr.addUser(req, res, (success, error) => {
        if (error) {
            return res.status(500).json({
                "message": error
            });
        } else {
            return res.status(200).json(success);
        }
    });
}

userCtr.getUserList = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    let filter = {};
    filter.userRole = 2;
    if (!utils.empty(req.authUser) && req.authUser.userRole === 2) {
        filter.status = "ACTIVE";
    }
    filter._id = { "$ne": userId };
    if (!utils.empty(input.practiceLanguage)) {
        // filter.practiceLanguage = { $regex: new RegExp('^' + input.practiceLanguage, 'i') };
        filter["practiceLanguage.language"] = input.practiceLanguage;
    }
    if (!utils.empty(input.nativeLanguage) && input.nativeLanguage.length > 0 && typeof input.nativeLanguage === 'object') {
        filter.nativeLanguage = { "$in": input.nativeLanguage };
    }
    if (!utils.empty(input.nativeLangCode)) {
        filter.nativeLangCode = input.nativeLangCode;
    }
    if (!utils.empty(input.praticeLangCode)) {
        filter.praticeLangCode = input.praticeLangCode;
    }
    if (!utils.empty(input.ageMin) && !utils.empty(input.ageMax)) {
        filter.age = {
            '$gte': input.ageMin,
            '$lte': input.ageMax
        }
    }
    if (!utils.empty(input.gender)) {
        filter.gender = input.gender;
    }
    if (!utils.empty(input.country)) {
        filter.country = input.country;
    }
    let limit = config.MAX_RECORDS;
    let pg = 0;
    if (utils.isDefined(input.pg) && (parseInt(input.pg) > 1)) {
        pg = parseInt(input.pg - 1) * limit;
    } else {
        if (input.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.searchName)) {
        filter.fullName = new RegExp(input.searchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "i");
    }
    let select = userCtr.getFields('login');
    userModel.getUserList(filter, pg, limit, select, (err, total, users) => {
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else if (total > 0) {
            let pages = Math.ceil(total / limit);
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: limit
            };
            res.status(200).json({
                pagination: pagination,
                data: users,
                status: true,
                imageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/user/",
                message: ""
            });
        } else {
            res.status(400).json({
                data: [],
                status: true,
                "message": req.t("NO_RECORD_FOUND")
            });
        }
    });
}

userCtr.updateUser = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    if (!utils.empty(input.userId) && ObjectId.isValid(input.userId)) {
        userId = input.userId;
    }
    waterfall([
        (callback) => {
            userModel.getUserById(userId, (err, oldUserData) => {
                if (!!err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(null, oldUserData);
                }
            });
        },
        (oldUserData, callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {

                let profilePic = oldUserData.profilePic;
                let old_path = '';
                if (!utils.empty(profilePic)) {
                    old_path = process.env.BASE_URL + config.USER_IMAGE_PATH + profilePic;
                }
                userUtil.saveUserProfilePicture(req.files, (result) => {
                    if (!utils.empty(result.error)) {
                        callback(result.error, "");
                    } else {
                        callback(null, result.data[0]);
                    }
                });
                // utils.uploadImageInServer(req.files.profilePic, config.USER_IMAGE_PATH, old_path, (err, imageName) => {
                //     callback(null, imageName);
                // });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let userData = {
                updatedAt: new Date()
            };

            if (!utils.empty(input.fullName)) {
                userData.fullName = input.fullName;
            }
            if (!utils.empty(input.email)) {
                userData.email = input.email;
            }
            if (!utils.empty(input.userName)) {
                userData.userName = input.userName;
            }
            if (!utils.empty(input.country)) {
                userData.country = input.country;
            }
            if (!utils.empty(input.gender)) {
                userData.gender = input.gender;
            }
            if (!utils.empty(input.userBio)) {
                userData.userBio = input.userBio;
            }
            if (!utils.empty(input.age)) {
                userData.age = input.age;
            }
            if (!utils.empty(input.nativeLanguage)) {
                userData.nativeLanguage = input.nativeLanguage;
            }
            if (!utils.empty(image)) {
                userData.profilePic = image;
            }
            if (!utils.empty(input.nativeLangCode)) {
                userData.nativeLangCode = input.nativeLangCode;
            }
            if (!utils.empty(input.praticeLangCode)) {
                userData.praticeLangCode = input.praticeLangCode;
            }
            if (!utils.empty(input.status)) {
                userData.status = input.status;
            }

            let languageArr = [];
            if (!!input.practiceLanguage && input.practiceLanguage.length > 0 && typeof input.practiceLanguage === 'object') {
                input.practiceLanguage.map((obj) => {
                    languageArr.push({ language: obj });
                });
                userData.practiceLanguage = languageArr;
            }
            userModel.update({
                _id: userId
            }, userData, (err, userDetail) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        },
        (callback) => {
            userModel.load(userId, (err, userDetail) => {
                if (!!err) {
                    callback(err, userDetail);
                } else {
                    callback(null, userDetail);
                }
            });
        }
    ], (err, userDetail) => {
        if (!utils.empty(err)) {
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            userDetail['imagePath'] = "https://s3.ap-south-1.amazonaws.com/multikeybucket/user/" + userDetail.profilePic;
            userDetail['secretToken'] = req.headers['x-auth-token'];
            return res.status(200).json({
                data: userDetail,
                status: true,
                "message": req.t("USER_UPDATED")
            });
        }
    });
}

userCtr.installation = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    let createData = {
        timezone: input.timezone,
        appVersion: input.appVersion,
        buildNumber: input.buildNumber,
        appName: input.appName,
        deviceType: input.deviceType,
        badge: input.badge,
        appIdentifier: input.appIdentifier,
        localeIdentifier: input.localeIdentifier,
        deviceToken: input.deviceToken,
        deviceId: input.deviceId,
        owner: userId
    };
    installationModel.loadByOwnerAndInstallation(userId, (err, details) => {
        if (!!err) {
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            if (!!details && details.length > 0) {
                installationModel.update({ owner: userId }, createData, (err, returnData) => {
                    if (!!err) {
                        return res.status(500).json({
                            data: [],
                            status: false,
                            "message": req.t("DB_ERROR")
                        });
                    } else {
                        return res.status(200).json({
                            data: [],
                            status: true,
                            "message": req.t("INSTALLATION_SUCCESS")
                        });
                    }
                });
            } else {
                let installationObj = new installationModel(createData);
                installationObj.save((err, details) => {
                    if (utils.empty(err)) {
                        return res.status(200).json({
                            data: [],
                            status: true,
                            "message": req.t("INSTALLATION_SUCCESS")
                        });
                    } else {
                        return res.status(500).json({
                            data: [],
                            status: false,
                            "message": req.t("DB_ERROR")
                        });
                    }
                });
            }
        }
    });
}

userCtr.sendmsgNotification = (req, res) => {
    let userId = req.authUser._id;
    let input = req.body;

    installationModel.loadByOwnerAndInstallation(input.userId, (err, deviceDetails) => {
        if (utils.empty(err)) {
            if (!utils.empty(deviceDetails) && deviceDetails.length > 0) {
                notificationUtils.sendPushNotification(input, deviceDetails[0].deviceToken, (err, user) => {});
            }
        }
    });

    waterfall([
        (callback) => {
            let obj = {
                from: userId,
                to: input.userId,
                message: input.message,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            let messageObj = new messageModel(obj);
            messageObj.save((err) => {
                if (!!err) {
                    callback(err);
                } else {
                    userCtr.updateMessagesId(messageObj._id, userId, input.userId);
                    callback(null);
                }
            })
        }
    ], (err) => {
        if (utils.empty(err)) {
            return res.status(200).json({
                data: [],
                status: true,
                "message": req.t("MSG_SEND_SUCCESS")
            });
        } else {
            return res.status(500).json({
                data: [],
                status: false,
                "message": err
            });
        }
    })
}

userCtr.updateMessagesId = (id, loginUserId, otherUserId) => {
    messageModel.update({ from: loginUserId, to: otherUserId }, { messageId: id }, { multi: true }, (er, details) => {});
    messageModel.update({ from: otherUserId, to: loginUserId }, { messageId: id }, { multi: true }, (er, details) => {});
}

userCtr.getMessages = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    let filter = {
        "$or": [{ "$and": [{ from: userId, to: input.userId }] },
            { "$and": [{ to: userId, from: input.userId }] }
        ]
    };

    let limit = config.MAX_RECORDS;
    let pg = 0;
    if (utils.isDefined(input.pg) && (parseInt(input.pg) > 1)) {
        pg = parseInt(input.pg - 1) * limit;
    } else {
        if (input.pg == -1) {
            pg = 0;
            limit = null;
        }
    }

    messageModel.getMessageList(filter, pg, limit, (err, total, messages) => {
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else if (total > 0) {
            messageModel.update({ from: userId, to: input.userId }, { read: 0 }, { multi: true }, (er, details) => {});
            messageModel.update({ from: input.userId, to: userId }, { read: 0 }, { multi: true }, (er, details) => {});

            let pages = Math.ceil(total / limit);
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: limit
            };
            res.status(200).json({
                pagination: pagination,
                data: messages,
                status: true,
                message: ""
            });
        } else {
            res.status(400).json({
                data: [],
                status: true,
                "message": req.t("NO_RECORD_FOUND")
            });
        }
    });
}


userCtr.forgotPassword = (req, res) => {
    let input = req.body;
    userModel.getUserByEmail(input.email, (err, result) => {
        if (!utils.empty(result) && result.length > 0) {
            let pass_ = utils.getRandomString(9);
            result[0].password = pass_;
            userUtil.sendForgotPasswordEmail(result[0], pass_, (err, isEmailSent) => {
                if (isEmailSent == true) {
                    let userData = {
                        password: utils.dataEncrypt(pass_)
                    };
                    userModel.update({
                        email: input.email
                    }, userData, (err, userDetail) => {
                        if (!!err) {
                            return res.status(500).json({
                                status: false,
                                data: [],
                                "message": req.t("DB_ERROR")
                            });
                        } else {
                            return res.status(200).json({
                                status: true,
                                data: [],
                                message: req.t("FORGOT_MESSAGE")
                            });
                        }
                    });
                } else {
                    return res.status(500).json({
                        status: false,
                        data: [],
                        message: req.t("DB_ERROR")
                    });
                }
            });
        } else {
            return res.status(400).json({
                message: req.t("EMAIL_NOT_FOUND")
            });
        }
    });
};

userCtr.getContactUserList = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    let filter = [{
            "$match": {
                "$or": [{ from: ObjectId(userId) },
                    { to: ObjectId(userId) }
                ]

            }
        },
        { "$sort": { "createdAt": -1, } },
        {
            "$group": {
                "_id": "$messageId",
                "to": { "$first": "$to" },
                "message": { "$first": "$message" },
                "from": { "$first": "$from" },
                "createdAt": { "$first": "$createdAt" },
                "count": { "$sum": { "$cond": { if: { $eq: ["$read", 1], $eq: ["$to", userId] }, then: 1, else: 0 } } },
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "from",
                "foreignField": "_id",
                "as": "from"
            }
        },
        {
            "$unwind": "$from"
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "to",
                "foreignField": "_id",
                "as": "to"
            }
        },
        {
            "$unwind": "$to"
        },
        { "$sort": { "createdAt": 1, } },
        {
            "$project": {
                "_id": 1,
                "message": 1,
                "createdAt": 1,
                "count": 1,
                "from._id": 1,
                "from.fullName": 1,
                "from.email": 1,
                "from.userName": 1,
                "from.profilePic": 1,
                "to._id": 1,
                "to.fullName": 1,
                "to.email": 1,
                "to.userName": 1,
                "to.profilePic": 1
            }
        },
    ];

    let limit = config.MAX_RECORDS;
    let pg = 0;
    if (utils.isDefined(input.pg) && (parseInt(input.pg) > 1)) {
        pg = parseInt(input.pg - 1) * limit;
    } else {
        if (input.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    messageModel.contactUserList(filter, pg, limit, (err, userList) => {
        let total = (!!userList) ? userList.length : 0;
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else if (total > 0) {
            let pages = Math.ceil(total / limit);
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: limit
            };
            userList.reverse();
            res.status(200).json({
                pagination: pagination,
                data: userList,
                status: true,
                message: "",
                imageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/user/",
            });
        } else {
            res.status(400).json({
                data: [],
                status: true,
                "message": req.t("NO_RECORD_FOUND")
            });
        }
    });
}

userCtr.setPassword = (req, res) => {
    let input = req.body;
    let dncData = JSON.parse(req.decryptedHash);
    userModel.getUserById(dncData.userId, (user) => {
        if (!user) {
            return res.status(400).json({
                "message": req.t("NOT_VALID_USER")
            });
        }
        let userData = {
            password: utils.dataEncrypt(input.password),
            verified: 1,
            userId: dncData.userId
        };
        userModel.updateUser(userData, {
            id: dncData.userId
        }, (userDetail) => {
            return res.status(200).json({
                "message": req.t("PASSWORD_SET")
            });
        }, (err) => {
            console.log(err);
            return res.status(500).json({
                "message": req.t("DB_ERROR")
            });
        });
    });
}

userCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.role;
    let loginUser = req.authUser;
    let updateData = {
        status: input.status
    };
    if (!utils.empty(loginUser) && loginUser.userRole == 1) {
        userModel.update({
            _id: input.userId
        }, updateData, (err, userDetail) => {
            if (!!err) {
                console.log(err);
                return res.status(500).json({
                    data: [],
                    status: false,
                    "message": req.t("DB_ERROR")
                });
            } else {
                return res.status(200).json({
                    data: [],
                    status: true,
                    "message": req.t("STATUS_CHANGE")
                });
            }
        });
    } else {
        return res.status(500).json({
            "message": req.t("NOT_AUTHORIZED")
        });
    }

}

//verify email address
userCtr.verify = (req, res) => {
    let input = req.body;
    let dncData = JSON.parse(req.decryptedHash);
    userModel.getUserById(dncData.userId, (user) => {
        if (utils.empty(user)) {
            return res.status(400).json({
                "message": req.t("NOT_VALID_USER")
            });
        } else {
            if (dncData.email == user.email) {
                return res.status(400).json({
                    "message": req.t("ALREADY_VERIFY_EMAIL")
                });
            } else {
                let userData = {
                    email: dncData.email
                };
                userModel.updateUser(userData, {
                    id: dncData.userId
                }, (userDetail) => {
                    return res.status(200).json({
                        "message": req.t("EMAIL_VERIFY")
                    });
                }, (err) => {
                    console.log(err);
                    return res.status(500).json({
                        "message": req.t("DB_ERROR")
                    });
                });
            }
        }
    });
};

userCtr.resetPassword = (req, res) => {
    let input = req.body;
    let userId = req.authUser.id;
    userModel.getUserById(userId, (user) => {
        if (!user) {
            return res.status(400).json({
                "message": req.t("NOT_VALID_USER")
            });
        } else if (!user.authenticate(input.oldPassword)) {
            return res.status(400).json({
                "message": req.t("OLD_PASSWORD_NOT_FOUND")
            });
        } else {
            let userData = {
                password: utils.dataEncrypt(input.newPassword),
                userId: userId
            };
            userModel.updateUser(userData, {
                id: userId
            }, (userDetail) => {
                return res.status(200).json({
                    "message": req.t("PASSWORD_SET")
                });
            }, (err) => {
                console.log(err);
                return res.status(500).json({
                    "message": req.t("DB_ERROR")
                });
            });
        }
    });
}

userCtr.logout = (req, res) => {
    let input = req.body;
    let userId = req.authUser.id;
    let token = (req.headers && req.headers['x-auth-token']);
    if (utils.empty(token)) {
        token = (req.body && req.body['x-auth-token']);
    }

    userTokenModel.deleteToken({ token: token }, (err) => {
        if (!utils.empty(err)) {
            console.log(err)
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            return res.status(200).json({
                data: [],
                status: true,
                "message": req.t("USER_LOGOUT")
            });
        }
    });
}

userCtr.addReview = (req, res) => {
    let userId = req.authUser._id;
    let input = req.body;

    waterfall([
        (callback) => {
            let obj = {
                userId: userId,
                rate: input.rate,
                review: input.review,
                eventPlaceType: input.eventPlaceType,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (input.eventPlaceType == "event") {
                obj.eventId = input.id;
            } else {
                obj.placeId = input.id;
            }
            let reviewObj = new reviewModel(obj);
            reviewObj.save((err) => {
                if (!!err) {
                    callback(err, null);
                } else {
                    callback(null, reviewObj);
                }
            })
        }
    ], (err, reviewObj) => {
        if (utils.empty(err)) {
            return res.status(200).json({
                data: reviewObj,
                status: true,
                "message": req.t("REVIEW_ADDED_SUCCESS")
            });
        } else {
            return res.status(500).json({
                data: [],
                status: false,
                "message": err
            });
        }
    })
}

userCtr.listReview = (req, res) => {
    let filter = {};
    let input = req.body;
    let loginUser = req.authUser;
    let limit = config.MAX_RECORDS;
    let pg = 0;
    if (utils.isDefined(input.pg) && (parseInt(input.pg) > 1)) {
        pg = parseInt(input.pg - 1) * limit;
    } else {
        if (input.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    filter.eventPlaceType = input.eventPlaceType;

    reviewModel.getList(filter, pg, limit, (err, total, messages) => {
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else if (total > 0) {
            let pages = Math.ceil(total / limit);
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: limit
            };
            res.status(200).json({
                pagination: pagination,
                data: messages,
                status: true,
                message: ""
            });
        } else {
            res.status(400).json({
                data: [],
                status: true,
                "message": req.t("NO_RECORD_FOUND")
            });
        }
    });
}

userCtr.deleteReview = (req, res) => {
    let input = req.body;
    let filter = {
        _id: input.id
    };

    reviewModel.deleteReview(filter, (err) => {
        if (!utils.empty(err)) {
            console.log(err)
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            return res.status(200).json({
                data: [],
                status: true,
                "message": req.t("REVIEW_DELETE")
            });
        }
    });
}

userCtr.addWhishlist = (req, res) => {
    let userId = req.authUser._id;
    let input = req.body;
    let message = "";
    let filter = {};
    filter.userId = req.authUser._id;
    filter.eventPlaceType = input.eventPlaceType;
    if (input.eventPlaceType == "event") {
        filter.eventId = input.id;
    } else {
        filter.placeId = input.id;
    }
    waterfall([
        (callback) => {
            wishlistModel.getData(filter, (err, eventDetails) => {
                if (!utils.empty(err)) {
                    console.log(err, 'err')
                    callback(req.t("DB_ERROR"));
                } else if (!utils.empty(eventDetails) && eventDetails.length > 0) {
                    callback(null, 1);
                } else {
                    callback(null, 0);
                }
            });
        },
        (existRecord, callback) => {
            if (existRecord == 1) {
                message = (input.eventPlaceType == "event") ? req.t("EVENT_REMOVE_WISHLIST") : req.t("PLACE_REMOVE_WISHLIST");
                wishlistModel.deleteRecord(filter, (err, userDetails) => {
                    if (!utils.empty(err)) {
                        callback(err)
                    } else {
                        callback(null)
                    }
                });
            } else {
                message = (input.eventPlaceType == "event") ? req.t("EVENT_ADD_WISHLIST") : req.t("PLACE_ADD_WISHLIST");
                let wishlistObj = new wishlistModel(filter);
                wishlistObj.save((err) => {
                    if (!!err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }

        }
    ], (err) => {
        if (utils.empty(err)) {
            return res.status(200).json({
                data: [],
                status: true,
                "message": message
            });
        } else {
            return res.status(500).json({
                data: [],
                status: false,
                "message": err
            });
        }
    })
}

userCtr.listWhishlist = (req, res) => {
    let filter = {};
    let input = req.body;
    let userId = req.authUser._id;
    let limit = config.MAX_RECORDS;
    let pg = 0;
    if (utils.isDefined(input.pg) && (parseInt(input.pg) > 1)) {
        pg = parseInt(input.pg - 1) * limit;
    } else {
        if (input.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.userId)) {
        userId = input.userId;
    }
    filter.eventPlaceType = input.eventPlaceType;
    filter.userId = userId;
    wishlistModel.getList(filter, pg, limit, (err, total, listRecord) => {
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else if (total > 0) {
            let pages = Math.ceil(total / limit);
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: limit
            };
            res.status(200).json({
                pagination: pagination,
                data: listRecord,
                status: true,
                message: "",
                eventImageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/event/",
                placeImageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/place/",
            });
        } else {
            res.status(400).json({
                data: [],
                status: true,
                "message": req.t("NO_RECORD_FOUND")
            });
        }
    });
}

userCtr.dashboard = (req, res) => {
    let filter = {};
    waterfall([
        (callback) => {
            userModel.count({ userRole: { "$ne": 1 } }).lean().exec((err, totalUser) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null, totalUser);
                }
            });
        },
        (totalUser, callback) => {
            eventModel.count({}).lean().exec((err, totalEvent) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null, totalUser, totalEvent);
                }
            });
        },
        (totalUser, totalEvent, callback) => {
            placeModel.count({}).lean().exec((err, totalPlace) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null, totalUser, totalEvent, totalPlace);
                }
            });
        }
    ], (err, totalUser, totalEvent, totalPlace) => {
        if (!!err) {
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            res.status(200).json({
                data: [{
                    totalUser: totalUser,
                    totalEvent: totalEvent,
                    totalPlace: totalPlace
                }],
                status: true,
                "message": ""
            });
        }
    });
}

userCtr.updatelocation = (req, res) => {
    let input = req.body;
    let userId = req.authUser._id;
    if (!utils.empty(input.userId) && ObjectId.isValid(input.userId)) {
        userId = input.userId;
    }
    waterfall([
        (callback) => {
            let updateData = {};
            updateData.loc = {
                type: "Point",
                coordinates: [input.longitude, input.latitude]
            }
            userModel.update({
                _id: userId
            }, updateData, (err, userDetail) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    ], (err, eventList) => {
        if (!!err) {
            console.log(err);
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            res.status(200).json({
                data: [],
                status: true,
                "message": req.t("LOCATION_UPDATE")
            });
        }
    });
}


userCtr.nearby = (req, res) => {
    let input = req.body;
    let loginUserId = req.authUser._id;
    let filter = {};
    waterfall([
        (callback) => {
            if (input.listType === "event") {
                eventModel.getNearby(input, (err, eventList) => {
                    if (!!err) {
                        callback(err);
                    } else {
                        callback(null, { events: eventList });
                    }
                });
            } else if (input.listType === "place") {
                placeModel.getNearby(input, (err, eventList) => {
                    if (!!err) {
                        callback(err);
                    } else {
                        callback(null, { places: eventList });
                    }
                });
            } else {
                userModel.getNearby(input, (err, eventList) => {
                    if (!!err) {
                        callback(err);
                    } else {
                        callback(null, { user: eventList });
                    }
                });
            }

        }
    ], (err, eventList) => {
        if (!!err) {
            console.log(err);
            res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            let responce = {
                user: [],
                places: [],
                events: [],
                status: true,
                "message": "",
                eventImageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/event/",
                placeImageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/place/",
                userImageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/user/",
            };
            if (!!eventList.user) {
                responce.user = eventList.user;
            }
            if (!!eventList.places) {
                responce.places = userCtr.setWishlistFlag(eventList.places, loginUserId, "place");
            }
            if (!!eventList.events) {
                responce.events = userCtr.setWishlistFlag(eventList.events, loginUserId, "event");
            }
            res.status(200).json(responce);
        }
    });
}


userCtr.setWishlistFlag = (places, loginUserId, type_) => {
    let temp;
    places.map((obj) => {
        temp = 0;
        if (!!obj.wishlist && obj.wishlist.length > 0) {
            obj.wishlist.map((item) => {
                if (item.eventPlaceType === type_ && item.eventId.toString() == obj._id.toString() && item.userId.toString() == loginUserId.toString()) {
                    temp = 1;
                }
            });
        }
        obj["eventFlag"] = (temp == 1) ? 1 : 0
        delete obj.wishlist;
    })
    return places;
}

module.exports = userCtr;