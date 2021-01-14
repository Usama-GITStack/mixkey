let mongoose = require('mongoose');
let notificationUtils = require("../../helper/notificationUtils");
let utils = require("../../helper/utils");

let schema = mongoose.Schema;

let messagesSchema = new schema({
    from: {
        type: schema.Types.ObjectId,
        ref: 'users',
    },
    to: {
        type: schema.Types.ObjectId,
        ref: 'users',
    },
    message: {
        type: String,
        required: false,
    },
    read: {
        type: Number,
        default: 1,
        required: true
    },
    messageId: {
        type: String,
        required: false,
    },
    audio: {
        type: String,
        required: false,
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
messagesSchema.statics.load = function(installationId, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find({ _id: installationId }, select).exec(callback);
};

messagesSchema.statics.getMessageList = function(filter, pg, limit, callback) {
    let paging = {};
    if (limit !== null) {
        paging = { limit: limit, skip: pg };
    }
    this.count(filter).exec((err, total) => {
        if (!!err) {
            callback(err, 0, []);
        } else {
            this.find(filter, {}, paging).sort({ 'createdAt': -1 }).exec(function(err, result) {
                callback(err, total, result);
            });
        }
    });
};

messagesSchema.statics.contactUserList = function(filter, pg, limit, callback) {
    let paging = {};
    if (limit !== null) {
        paging = { limit: limit, skip: pg };
    }
    this.aggregate(filter, callback);
};

let messagesModel = mongoose.model('messages', messagesSchema);

module.exports = messagesModel;