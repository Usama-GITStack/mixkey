let mongoose = require('mongoose');
let notificationUtils = require("../../helper/notificationUtils");
let utils = require("../../helper/utils");
let installationModel;

let schema = mongoose.Schema;

let installationSchema = new schema({
    timezone: {
        type: String,
        required: false,
    },
    appVersion: {
        type: String,
        required: false,
    },
    buildNumber: {
        type: String,
    },
    appName: {
        type: String,
    },
    deviceType: {
        type: String,
        enum: ['ios', 'android'],
        default: "android",
        required: true,
    },
    owner: {
        type: schema.Types.ObjectId,
        ref: 'users',
    },
    badge: {
        type: Number,
        default: 0,
    },
    notification: {
        type: Number,
        default: 0
    },
    appIdentifier: {
        type: String,
    },
    localeIdentifier: {
        type: String,
    },
    deviceToken: {
        type: String,
        sparse: true
    },
    deviceId: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

/**
 * static function
 */
installationSchema.statics.load = function(installationId, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ _id: installationId }, select).exec(callback);
};

installationSchema.statics.existsId = function(installationId, callback) {
    if (!installationId) {
        callback(false);
    } else {
        this.load(installationId, (err, existsResult) => {
            console.log(err);
            console.log(existsResult);
            callback((!utils.isDefined(err) && existsResult.length > 0) ? true : false);
        });
    }
};

installationSchema.statics.getTimezone = function(installationId, callback) {
    this.find({ _id: installationId }).select("timezone").lean().exec(callback);
};

installationSchema.statics.loadByOwner = function(owner, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ owner: owner }, select).exec(callback);
};

installationSchema.statics.loadByOwnerAndInstallation = function(owner, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ owner: owner }, select).exec(callback);
};

installationSchema.statics.loadByToken = function(deviceToken, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ "deviceToken": deviceToken }, select).exec(callback);
};

installationSchema.statics.removeTokens = function(filter, callback) {
    this.findAllAndRemove(filter, callback);
}

installationSchema.statics.setUserInstallation = function(installationId, owner, callback) {
    let conditions = { _id: installationId }
    let notification = notificationUtils.getNotificationType();
    let updateData = { owner: owner, notification: notification, badge: 0 }
    this.update(conditions, updateData, { multi: true }, callback);
};

installationSchema.statics.updateDeviceToken = function(deviceToken, newDeviceToken, callback) {
    if (typeof newDeviceToken === 'function' && !callback) {
        callback = newDeviceToken;
        newDeviceToken = 0;
    }
    let conditions = { deviceToken: deviceToken };
    this.update(conditions, { $set: { deviceToken: newDeviceToken } }, { multi: true }, callback);
}

installationModel = mongoose.model('installation', installationSchema);

module.exports = installationModel;