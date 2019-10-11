const placeModel = require('./placeModel');
const utils = require('../../helper/utils');
const placeUtil = require('./placeHelper');
const waterfall = require('async-waterfall');
const wishlistModel = require('../user/wishlistModel');
const reviewModel = require('../user/reviewModel');

let placeCtr = {};

placeCtr.getFields = (type) => {
    let common = [
        "_id",
        "placeName",
        "placeTitle",
        "description",
        "image",
        "location",
        "locations",
        "languages",
        "loc",
        "status"
    ];
    return common;
  };
  

  placeCtr.getPlaceById = (req,res) => {
    
    console.log(req.body);
      let placeId;
      if (req.body.placeId) {
        placeId = req.body.placeId;
      }
      let select = placeCtr.getFields();
      placeModel.load(placeId, select,(err, placeDetail) => {
          if (!!err) {
              return res.status(500).json({
                  data: [],
                  status: false,
                  "message": req.t("DB_ERROR")
              });
          } else {
              return res.status(200).json(placeDetail);
          }
      });
  }


placeCtr.createPlace = (req, res) => {
    let input = req.body;
    waterfall([
            (callback) => {
                if (!utils.empty(req.files) && !utils.empty(req.files.image)) {
                    placeUtil.saveplacePicture(req.files, (result) => {
                        if (!utils.empty(result.error)) {
                            callback(result.error, "");
                        } else {
                            callback(null, result.data[0]);
                        }
                    });
                } else if (!utils.empty(input.image)) {
                    placeUtil.savEplaceImageByUrl(input.image, (result) => {
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
                let placeData = {
                    placeName: input.placeName.toLowerCase(),
                    placeTitle: input.placeTitle,
                    description: input.description,
                    location: 'aaaa', //input.location,
                    loc: {
                        type: "Point",
                        coordinates:  [1.0, 1.0] //[input.longitude, input.latitude]
                    },
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                if (!utils.empty(image)) {
                    placeData.image = image;
                }
                let locationArr = [];
                if (!!input.locations && input.locations.length > 0 && typeof input.locations === 'object') {
                    input.locations.map((v) => {
                        let obj = JSON.parse(v);
                        locationArr.push({ location: obj.location, loc: {type: 'Point', coordinates: [obj.longitude, obj.latitude]} });
                    });
                }
                placeData.locations = locationArr;

                let languageArr = [];
                if (!!input.languages && input.languages.length > 0 && typeof input.languages === 'object') {
                    input.languages.map((obj) => {
                        languageArr.push({ language: obj });
                    });
                }
                placeData.languages = languageArr;

                var placeObject = new placeModel(placeData);
                placeObject.save((err, placeDetails) => {
                    if (utils.isDefined(err)) {
                        callback(err);
                    } else {
                        callback(null, placeObject);
                    }
                });
            }
        ],
        (err, placeDetails) => {
            if (!!err) {
                return res.status(500).json({
                    data: [],
                    status: false,
                    "message": req.t("DB_ERROR")
                });
            } else {
                let response = {
                    "message": "",
                    data: placeDetails,
                    status: true,
                    // imageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/place/",
                    imageurlPath: config.placeURL,
                }
                return res.status(200).json(response);
            }
        });
}

placeCtr.getPlaceList = (req, res) => {
    let input = req.body;
    let loginUserId = req.authUser._id;
    let filter = {};
    filter.status = "ACTIVE";

    if (!!input.languages && input.languages.length > 0 && typeof input.languages === 'object') {
        filter["languages.language"] = { "$in": input.languages };
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
        filter.placeName = new RegExp(input.searchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "i");
    }
    placeModel.placeList(filter, pg, limit, loginUserId, (err, total, places) => {
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
                data: placeCtr.setWishlistFlag(places, loginUserId),
                status: true,
                // imageurlPath: "https://s3.ap-south-1.amazonaws.com/multikeybucket/place/",
                imageurlPath: config.placeURL,
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
};

placeCtr.setWishlistFlag = (places, loginUserId) => {
    let temp;
    places.map((obj) => {
        temp = 0;
        if (!!obj.wishlist && obj.wishlist.length > 0) {
            obj.wishlist.map((item) => {
                if (item.eventPlaceType === "place" && item.placeId.toString() == obj._id.toString() && item.userId.toString() == loginUserId.toString()) {
                    temp = 1;
                }
            });
        }
        obj["placeFlag"] = (temp == 1) ? 1 : 0
        obj["imageURL"] = config.placeURL
        delete obj.wishlist;
    })
    return places;
}

placeCtr.updatePlace = (req, res) => {
    let input = req.body;
    waterfall([
        (callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.image)) {
                placeUtil.saveplacePicture(req.files, (result) => {
                    if (!utils.empty(result.error)) {
                        callback(result.error, "");
                    } else {
                        callback(null, result.data[0]);
                    }
                });
            } else if (!utils.empty(input.image)) {
                placeUtil.savEplaceImageByUrl(input.image, (result) => {
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
            let placeData = {};

            if (!utils.empty(input.placeName)) {
                placeData.placeName = input.placeName;
            }
            if (!utils.empty(input.placeTitle)) {
                placeData.placeTitle = input.placeTitle;
            }
            if (!utils.empty(input.description)) {
                placeData.description = input.description;
            }
            // if (!utils.empty(input.location)) {
            //     placeData.location = input.location;
            // }
            // if (!utils.empty(input.latitude) && !utils.empty(input.longitude)) {
            //     placeData.loc = {
            //         type: "Point",
            //         coordinates: [input.longitude, input.latitude]
            //     }
            // }
            if (!utils.empty(input.status)) {
                placeData.status = input.status;
            }
            if (!utils.empty(image)) {
                placeData.image = image;
            }

            let locationArr = [];
            if (!!input.locations && input.locations.length > 0 && typeof input.locations === 'object') {
                input.locations.map((v) => {
                    let obj = JSON.parse(v);
                    locationArr.push({ location: obj.location, loc: {type: 'Point', coordinates: [obj.longitude, obj.latitude]} });
                });
            }
            placeData.locations = locationArr;

            let languageArr = [];
            if (!!input.languages && input.languages.length > 0 && typeof input.languages === 'object') {
                input.languages.map((obj) => {
                    languageArr.push({ language: obj });
                });
            }
            placeData.languages = languageArr;

            placeModel.update({
                _id: input.placeId
            }, placeData, (err) => {
                if (!!err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        },
        (callback) => {
            placeModel.load(input.placeId, (err, placeDetail) => {
                if (!!err) {
                    callback(err, placeDetail);
                } else {
                    callback(null, placeDetail);
                }
            });
        }
    ], (err, placeDetail) => {
        if (!utils.empty(err)) {
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            return res.status(200).json({
                data: placeDetail,
                status: true,
                "message": req.t("PLACE_UPDATED")
            });
        }
    });
}

placeCtr.statusChange = (req, res) => {
    let input = req.body;
    let role = req.role;
    let loginplace = req.authplace;
    let updateData = {
        status: input.status
    };
    let filter = {
        id: input.placeId
    };
    if (!utils.empty(loginplace) && loginplace.placeRole == 1) {
        placeModel.updateplace(updateData, filter, (placeUpdate) => {
            return res.status(200).json({
                "message": req.t("STATUS_CHANGE")
            });
        }, (err) => {
            console.log(err);
            return res.status(500).json({
                "message": req.t("DB_ERROR")
            });
        });
    } else {
        return res.status(500).json({
            "message": req.t("NOT_AUTHORIZED")
        });
    }
}

placeCtr.deletePlace = (req, res) => {
    let input = req.body;
    let filter = {
        _id: input.id
    };

    placeModel.deleteRecord(filter, (err) => {
        if (!utils.empty(err)) {
            console.log(err)
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            wishlistModel.deleteRecord({ placeId: input.id }, (err, data) => {})
            reviewModel.deleteReview({ placeId: input.id }, (err, data) => {})
            return res.status(200).json({
                data: [],
                status: true,
                "message": req.t("PLACE_DELETE")
            });
        }
    });
}

module.exports = placeCtr;