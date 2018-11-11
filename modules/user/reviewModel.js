let mongoose = require('mongoose');
let notificationUtils = require("../../helper/notificationUtils");
let utils = require("../../helper/utils");

let schema = mongoose.Schema;

let reviewsSchema = new schema({
    eventId: {
        type: schema.Types.ObjectId,
        ref: 'events',
    },
    placeId: {
        type: schema.Types.ObjectId,
        ref: 'places',
    },
    userId: {
        type: schema.Types.ObjectId,
        ref: 'users',
    },
    review: {
        type: String,
        required: false,
    },
    rate: {
        type: Number,
        required: false,
    },
    eventPlaceType: {
        type: String,
        enum: ['event', 'place'],
        defaultValue: "event"
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
reviewsSchema.statics.getReview = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

reviewsSchema.statics.getList = function(filter, pg, limit, callback) {
    let paging = {};
    if (limit !== null) {
        paging = { limit: limit, skip: pg };
    }
    this.count(filter).exec((err, total) => {
        if (!!err) {
            callback(err, 0, []);
        } else {
            this.find(filter, {}, paging).sort({ 'createdAt': 1 })
                .populate('userId', '_id fullName email userName profilePic')
                .populate('eventId', '_id title image eventDate eventFee status')
                .populate('placeId', '_id placeName image placeTitle status')
                .exec(function(err, result) {
                    callback(err, total, result);
                });
        }
    });
};
reviewsSchema.statics.deleteReview = function(filter, callback) {
    this.deleteMany(filter, callback);
};


let reviewsModel = mongoose.model('reviews', reviewsSchema);

module.exports = reviewsModel;