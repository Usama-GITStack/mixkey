const jwt = require('../../helper/jwt');
const eventModel = require('./eventModel');
const eventMiddleware = require('./eventMiddleware');
const utils = require('../../helper/utils');
const eventUtil = require('./eventHelper');
const waterfall = require('async-waterfall');
const fs = require('fs');
const wishlistModel = require('../user/wishlistModel');
const reviewModel = require('../user/reviewModel');

let eventCtr = {};

eventCtr.getFields = (type) => {
  let common = [
      "_id",
      "title",
      "description",
      "image",
      "startDate",
      "endDate",
      "eventFee",
      "location",
      "loc",
      "learningLanguage",
      "status"
  ];
  return common;
};



eventCtr.createEvent = (req, res) => {
  let input = req.body;
  waterfall(
    [
      callback => {
        if (!utils.empty(req.files) && !utils.empty(req.files.image)) {
          eventUtil.saveEventPicture(req.files, result => {
            if (!utils.empty(result.error)) {
              callback(result.error, '');
            } else {
              callback(null, result.data[0]);
            }
          });
        } else if (!utils.empty(input.image)) {
          eventUtil.savEeventImageByUrl(input.image, result => {
            if (!utils.empty(result.error)) {
              callback(result.error, '');
            } else {
              callback(null, result.data[0]);
            }
          });
        } else {
          callback(null, null);
        }
      },
      (image, callback) => {
        let eventData = {
          title: input.title.toLowerCase(),
          description: input.description,
          startDate: input.eventStartDate,
          // startDate: input.startDate,
          endDate: input.eventEndDate,
          eventFee: input.eventFee,
          location: input.location,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          loc: {
            type: 'Point',
            coordinates: [input.longitude, input.latitude],
          },
        };
        let languageArr = [];
        if (!!input.learningLanguage && input.learningLanguage.length > 0 && typeof input.learningLanguage === 'object') {
          input.learningLanguage.map(obj => {
            languageArr.push({ language: obj });
          });
        }
        eventData.learningLanguage = languageArr;

        if (!utils.empty(image)) {
          eventData.image = image;
        }

        var eventObject = new eventModel(eventData);
        eventObject.save((err, eventDetails) => {
          if (utils.isDefined(err)) {
            callback(err);
          } else {
            callback(null, eventObject);
          }
        });
      },
    ],
    (err, eventDetails) => {
      if (!!err) {
        console.log(err);
        return res.status(500).json({
          data: [],
          status: false,
          message: req.t('DB_ERROR'),
        });
      } else {
        let response = {
          message: '',
          data: eventDetails,
          status: true,
          imageurlPath: config.eventURL,
        };
        return res.status(200).json(response);
      }
    },
  );
};

eventCtr.getEventList = (req, res) => {

  
  let input = req.body;
  let loginUserId = req.authUser._id;
  let filter = {};
  filter.status = 'ACTIVE';
  if (!utils.empty(input.title)) {
    filter.title = {
      $regex: new RegExp('^' + input.title, 'i'),
    };
  }
  if (!!input.learningLanguage && input.learningLanguage.length > 0 && typeof input.learningLanguage === 'object') {
    filter['learningLanguage.language'] = { $in: input.learningLanguage };
  }
  let limit = config.MAX_RECORDS;
  let pg = 0;
  if (utils.isDefined(input.pg) && parseInt(input.pg) > 1) {
    pg = parseInt(input.pg - 1) * limit;
  } else {
    if (input.pg == -1) {
      pg = 0;
      limit = null;
    }
  }
  if (!utils.empty(input.searchName)) {
    filter.title = new RegExp(input.searchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  }
  eventModel.eventList(filter, pg, limit, loginUserId, (err, total, events) => {
    if (!!err) {
      res.status(500).json({
        data: [],
        status: false,
        message: req.t('DB_ERROR'),
      });
    } else if (total > 0) {
      let pages = Math.ceil(total / limit);
      let pagination = {
        pages: pages ? pages : 1,
        total: total,
        max: limit,
      };
      res.status(200).json({
        pagination: pagination,
        data: eventCtr.setWishlistFlag(events, loginUserId),
        status: true,
        imageurlPath: config.eventURL,
        message: '',
      });
    } else {
      res.status(400).json({
        data: [],
        status: true,
        message: req.t('NO_RECORD_FOUND'),
      });
    }
  });
};

eventCtr.getEventById = (req,res) => {
  console.log("Hittingg!!!");
  console.log(req.body);
    let eventId;
    if (req.body.eventId) {
      eventId = req.body.eventId;
    }
    let select = eventCtr.getFields();
    eventModel.load(eventId, select,(err, eventDetail) => {
        if (!!err) {
            return res.status(500).json({
                data: [],
                status: false,
                "message": req.t("DB_ERROR")
            });
        } else {
            return res.status(200).json(eventDetail);
        }
    });
}

eventCtr.getActiveEventList = (req, res) => {
  let input = req.body;
  let loginUserId = req.authUser._id;
  let currentDate = new Date();
  // let filter = { startDate: { $lt: currentDate }, endDate: { $gt: currentDate } };
  let filter = { endDate: { $gt: currentDate } };
  filter.status = 'ACTIVE';
  if (!utils.empty(input.title)) {
    filter.title = {
      $regex: new RegExp('^' + input.title, 'i'),
    };
  }
  if (!!input.learningLanguage && input.learningLanguage.length > 0 && typeof input.learningLanguage === 'object') {
    filter['learningLanguage.language'] = { $in: input.learningLanguage };
  }
  let limit = config.MAX_RECORDS;
  let pg = 0;
  if (utils.isDefined(input.pg) && parseInt(input.pg) > 1) {
    pg = parseInt(input.pg - 1) * limit;
  } else {
    if (input.pg == -1) {
      pg = 0;
      limit = null;
    }
  }
  if (!utils.empty(input.searchName)) {
    filter.title = new RegExp(input.searchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  }
  eventModel.eventList(filter, pg, limit, loginUserId, (err, total, events) => {
    if (!!err) {
      res.status(500).json({
        data: [],
        status: false,
        message: req.t('DB_ERROR'),
      });
    } else if (total > 0) {
      let pages = Math.ceil(total / limit);
      let pagination = {
        pages: pages ? pages : 1,
        total: total,
        max: limit,
      };
      res.status(200).json({
        pagination: pagination,
        data: eventCtr.setWishlistFlag(events, loginUserId),
        status: true,
        imageurlPath: config.eventURL,
        message: '',
      });
    } else {
      res.status(400).json({
        data: [],
        status: true,
        message: req.t('NO_RECORD_FOUND'),
      });
    }
  });
};

eventCtr.setWishlistFlag = (places, loginUserId) => {
  let temp;
  places.map(obj => {
    temp = 0;
    if (!!obj.wishlist && obj.wishlist.length > 0) {
      obj.wishlist.map(item => {
        if (item.eventPlaceType === 'event' && item.eventId.toString() == obj._id.toString() && item.userId.toString() == loginUserId.toString()) {
          temp = 1;
        }
      });
    }
    obj['eventFlag'] = temp == 1 ? 1 : 0;
    obj['imageURL'] = config.eventURL;
    delete obj.wishlist;
  });
  return places;
};

eventCtr.updateEvent = (req, res) => {
  let input = req.body;
  waterfall(
    [
      callback => {
        if (!utils.empty(req.files) && !utils.empty(req.files.image)) {
          eventUtil.saveEventPicture(req.files, result => {
            if (!utils.empty(result.error)) {
              callback(result.error, '');
            } else {
              callback(null, result.data[0]);
            }
          });
        } else if (!utils.empty(input.image)) {
          eventUtil.savEeventImageByUrl(input.image, result => {
            if (!utils.empty(result.error)) {
              callback(result.error, '');
            } else {
              callback(null, result.data[0]);
            }
          });
        } else {
          callback(null, null);
        }
      },
      (image, callback) => {
        let eventData = {};

        if (!utils.empty(input.title)) {
          eventData.title = input.title.toLowerCase();
        }
        if (!utils.empty(input.description)) {
          eventData.description = input.description;
        }
        if (!utils.empty(input.eventStartDate)) {
          // eventData.startDate = input.startDate;
          eventData.startDate = input.eventStartDate;
        }
        if (!utils.empty(input.eventEndDate)) {
          eventData.endDate = input.eventEndDate;
        }
        if (!utils.empty(input.eventFee)) {
          eventData.eventFee = input.eventFee;
        }
        if (!utils.empty(input.location)) {
          eventData.location = input.location;
        }
        if (!utils.empty(input.latitude) && !utils.empty(input.longitude)) {
          eventData.loc = {
            type: 'Point',
            coordinates: [input.longitude, input.latitude],
          };
        }
        if (!utils.empty(input.status)) {
          eventData.status = input.status;
        }
        if (!utils.empty(image)) {
          eventData.image = image;
        }
        let languageArr = [];
        if (!!input.learningLanguage && input.learningLanguage.length > 0 && typeof input.learningLanguage === 'object') {
          input.learningLanguage.map(obj => {
            languageArr.push({ language: obj });
          });
        }
        eventData.learningLanguage = languageArr;
        eventModel.update(
          {
            _id: input.eventId,
          },
          eventData,
          err => {
            if (!!err) {
              console.log(err)
              callback(err);
            } else {
              console.log(err)
              callback(null);
            }
          },
        );
      },
      callback => {
        eventModel.load(input.eventId, (err, eventDetail) => {
          if (!!err) {
            callback(err, eventDetail);
          } else {
            callback(null, eventDetail);
          }
        });
      },
    ],
    (err, eventDetail) => {
      if (!utils.empty(err)) {
        return res.status(500).json({
          data: [],
          status: false,
          message: req.t('DB_ERROR'),
        });
      } else {
        return res.status(200).json({
          data: eventDetail,
          status: true,
          message: req.t('EVENT_UPDATED'),
        });
      }
    },
  );
};

eventCtr.statusChange = (req, res) => {
  let input = req.body;
  let role = req.role;
  let loginevent = req.authevent;
  let updateData = {
    status: input.status,
  };
  let filter = {
    id: input.eventId,
  };
  if (!utils.empty(loginevent) && loginevent.eventRole == 1) {
    eventModel.updateevent(
      updateData,
      filter,
      eventUpdate => {
        return res.status(200).json({
          message: req.t('STATUS_CHANGE'),
        });
      },
      err => {
        console.log(err);
        return res.status(500).json({
          message: req.t('DB_ERROR'),
        });
      },
    );
  } else {
    return res.status(500).json({
      message: req.t('NOT_AUTHORIZED'),
    });
  }
};

eventCtr.deleteEvent = (req, res) => {
  let input = req.body;
  let filter = {
    _id: input.id,
  };

  eventModel.deleteRecord(filter, err => {
    if (!utils.empty(err)) {
      console.log(err);
      return res.status(500).json({
        data: [],
        status: false,
        message: req.t('DB_ERROR'),
      });
    } else {
      wishlistModel.deleteRecord({ eventId: input.id }, (err, data) => {});
      reviewModel.deleteReview({ eventId: input.id }, (err, data) => {});
      return res.status(200).json({
        data: [],
        status: true,
        message: req.t('EVENT_DELETE'),
      });
    }
  });
};

module.exports = eventCtr;
