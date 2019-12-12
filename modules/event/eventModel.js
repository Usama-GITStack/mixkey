let fs = require('fs');
let mongoose = require('mongoose');
let utils = require("../../helper/utils");
let eventUtils = require("./eventHelper");

let schema = mongoose.Schema;

let eventSchema = new schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    eventFee: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    loc: {
        type: {
            type: String
        },
        coordinates: [Number]
    },
    learningLanguage: [{
        language: {
            type: String
        }
    }],
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        defaultValue: "ACTIVE"
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

eventSchema.index({
    eventDate: 1,
    learningLanguage: 1,
    "loc": "2dsphere"
});


eventSchema.statics.getNearby = function(input, callback) {
    // let obj = [{
    //     "$geoNear": {
    //         "near": {
    //             "type": "Point",
    //             "coordinates": [input.longitude, input.latitude]
    //         },
    //         "distanceField": "distance",
    //         "spherical": true,
    //         "maxDistance": 10000
    //     }
    // }];

    // // this.count(filter).exec((err, total) => {
    // this.aggregate(obj, (err, result) => {
    //     callback(err, result);
    // });
    // // });

    let milesToRadian = function(km) {
        let miles = km * 0.621371;
        var earthRadiusInMiles = 3963.2;
        return earthRadiusInMiles;
    };
    let query = {};
    query.loc = {
        $geoWithin: {
            $centerSphere: [
                [input.longitude, input.latitude], milesToRadian(input.distance)
            ]
        }
    }
    // if (!utils.empty(input.learningLanguage) && input.learningLanguage.length > 0 && typeof input.learningLanguage === 'object') {
    //     query["learningLanguage.language"] = {
    //         "$in": input.learningLanguage
    //     };
    // }
    this.find().exec((err, resultObj) => {
        let idobject = resultObj.map(obj => obj._id);
        this.aggregate([{
                "$match": {
                    "_id": { "$in": idobject },
                    "endDate":{ "$gt": new Date()}
                }
            },
            {
                "$lookup": {
                    "from": "wishlists",
                    "localField": "_id",
                    "foreignField": "eventId",
                    "as": "wishlist"
                }
            }
        ], callback);
    });
};

eventSchema.statics.eventList = function(filter, pg, limit, loginUserId, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    let obj = [{
        "$match": filter
    }, {
        "$sort": {
            "createdAt": -1,
        }
    }, {
        "$lookup": {
            "from": "wishlists",
            "localField": "_id",
            "foreignField": "eventId",
            "as": "wishlist"
        }
        // }, {
        //     $unwind: {
        //         path: '$wishlist',
        //         preserveNullAndEmptyArrays: true
        //     }
        // }, {
        //     "$group": {
        //         "_id": "$_id",
        //         "title": { "$first": "$title" },
        //         "description": { "$first": "$description" },
        //         "eventDate": { "$first": "$eventDate" },
        //         "location": { "$first": "$location" },
        //         "latitude": { "$first": "$latitude" },
        //         "longitude": { "$first": "$longitude" },
        //         "status": { "$first": "$status" },
        //         "image": { "$first": "$image" },
        //         "updatedAt": { "$first": "$updatedAt" },
        //         "createdAt": { "$first": "$createdAt" },
        //         "learningLanguage": { "$first": "$learningLanguage" },
        //         "eventFee": { "$first": "$eventFee" },
        //         "eventFlag": { "$first": "$wishlist.eventPlaceType" },
        //         "userIdForWish": { "$first": "$wishlist.userId" },
        //         "eventIdForWish": { "$first": "$wishlist.eventId" },
        //     }
    }, {
        "$project": {
            "_id": 1,
            "title": 1,
            "description": 1,
            "startDate": 1,
            "endDate": 1,
            "location": 1,
            "latitude": 1,
            "longitude": 1,
            "status": 1,
            "image": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "learningLanguage": 1,
            "eventFee": 1,
            "loc": 1,
            "wishlist": 1,
            // "eventFlag": {
            //     $cond: { if: { $eq: ["$eventFlag", "event"], $eq: ["$userIdForWish", loginUserId], $eq: ["$eventIdForWish", "$_id"] }, then: 1, else: 0 }
            // }
        }
    }];
    if (limit !== null) {
        obj.push({
            $skip: pg
        });
        obj.push({
            $limit: limit
        });
    }
    this.count(filter).exec((err, total) => {
        this.aggregate(obj, (err, result) => {
            callback(err, total, result);
        });
    });
};

eventSchema.statics.getEvents = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

eventSchema.statics.load = function(id, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.findOne({
        _id: id
    }).exec(callback);
};

eventSchema.statics.deleteRecord = function(filter, callback) {
    this.deleteOne(filter, callback);
};

let eventModel = mongoose.model('events', eventSchema);
// index errors check
eventModel.on('index', function(err) {
    if (err) console.error(err); // error occurred during index creation
});

module.exports = eventModel;