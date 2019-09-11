let fs = require('fs');
let mongoose = require('mongoose');
let utils = require("../../helper/utils");
let placeUtils = require("./placeHelper");
let schema = mongoose.Schema;

let placeSchema = new schema({
    placeName: {
        type: String,
        required: true,
        trim: true
    },
    placeTitle: {
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
    location: {
        type: String,
        required: false
    },
    locations: [
        {
            location: String,
            loc: {
                type: {
                    type: String
                },
                coordinates: [Number]
            },
        }
    ],
    languages: [{
        language: {
            type: String
        }
    }],
    loc: {
        type: {
            type: String
        },
        coordinates: [Number]
    },
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

placeSchema.index({
    languages: 1,
    "loc": "2dsphere"
});



placeSchema.statics.getNearby = function(input, callback) {
    let milesToRadian = function(km) {
        let miles = km * 0.621371;
        var earthRadiusInMiles = 3963.2;
        return earthRadiusInMiles;
    };
    let arePointsNear = function(checkPoint, centerPoint, km) {
        let ky = 40000 / 360;
        let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
        let dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
        let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
        return Math.sqrt(dx * dx + dy * dy) <= km;
    }
    let query = {};
    // query.loc = {
    //     $geoWithin: {
    //         $centerSphere: [
    //             [input.longitude, input.latitude], milesToRadian(input.distance)
    //         ]
    //     }
    // }
    query.locations = {
        $elemMatch: {
            "loc": {
                $geoWithin: {
                    $centerSphere: [
                        [input.longitude, input.latitude], milesToRadian(input.distance)
                    ]
                }
            }
        }
    };
    // if (!utils.empty(input.languages) && input.languages.length > 0 && typeof input.languages === 'object') {
    //     query["languages.language"] = {
    //         "$in": input.languages
    //     };
    // }
    this.find(query).exec((err, resultObj) => {
        let idobject = resultObj.map(obj => obj._id);
        this.aggregate([{
            "$match": {
                "_id": { "$in": idobject }
            }
        },
            {
                "$lookup": {
                    "from": "wishlists",
                    "localField": "_id",
                    "foreignField": "placeId",
                    "as": "wishlist"
                }
            }
        ], (err, result) => {
            if(!!err){
                callback(err, result);
            } else {
                let placeList = [];
                result.forEach((place, i) => {
                    let findIndex = -1;
                    for(let j = 0; j < resultObj.length; j++) {
                        if(resultObj[j]._id.toString() === place._id.toString()){
                            findIndex = j;
                            break;
                        }
                    }
                    if(findIndex !== -1) {
                        resultObj[findIndex].locations.forEach((location) => {
                            if(arePointsNear({lng: location.loc.coordinates[0], lat:location.loc.coordinates[1]}, {lng: input.longitude, lat: input.latitude}, input.distance)) {
                                let newPlace = {
                                    ...place,
                                    location: location.location,
                                    loc: location.loc
                                };
                                placeList.push(newPlace);
                            }
                        });
                    }
                });
                callback(err, placeList);
            }
        });
    });
};

placeSchema.statics.placeList = function(filter, pg, limit, loginUserId, select = {}, callback) {
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
            "foreignField": "placeId",
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
        //         "placeName": { "$first": "$placeName" },
        //         "placeTitle": { "$first": "$placeTitle" },
        //         "description": { "$first": "$description" },
        //         "languages": { "$first": "$languages" },
        //         "location": { "$first": "$location" },
        //         "latitude": { "$first": "$latitude" },
        //         "longitude": { "$first": "$longitude" },
        //         "status": { "$first": "$status" },
        //         "image": { "$first": "$image" },
        //         "updatedAt": { "$first": "$updatedAt" },
        //         "createdAt": { "$first": "$createdAt" },
        //         // "wishlist": { "$first": "$wishlist" },
        //         // "placeFlag": { "$first": "$wishlist.eventPlaceType" },
        //         // "userIdForWish": { "$first": "$wishlist.userId" },
        //         // "placeIdForWish": { "$first": "$wishlist.placeId" },
        //     }
    }, {
        "$project": {
            "_id": 1,
            "placeName": 1,
            "placeTitle": 1,
            "description": 1,
            "languages": 1,
            "location": 1,
            "loc": 1,
            "locations": 1,
            "status": 1,
            "image": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "wishlist": 1,
            // "placeFlag": {
            //     $cond: [{ if: { $and: [{ "$placeFlag": "place" }, { "$userIdForWish": loginUserId }, { "$placeIdForWish": "$_id" }] }, then: 1, else: 0 }]
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

placeSchema.statics.getPlaces = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

placeSchema.statics.load = function(id, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.findOne({
        _id: id
    }).exec(callback);
};

placeSchema.statics.deleteRecord = function(filter, callback) {
    this.deleteOne(filter, callback);
};

let placeModel = mongoose.model('places', placeSchema);
// index errors check
placeModel.on('index', function(err) {
    if (err) console.error(err); // error occurred during index creation
});

module.exports = placeModel;