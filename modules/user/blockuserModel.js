let mongoose = require('mongoose');
let utils = require("../../helper/utils");

let schema = mongoose.Schema;

let blockuserSchema = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: 'userId',
    },
    blockUserId: {
        type: schema.Types.ObjectId,
        ref: 'blockUserId',
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

/**
 * static function
 */
// wishlistSchema.statics.getData = function(filter, select = {}, callback) {
//     if (typeof select === 'function' && !callback) {
//         callback = select;
//         select = {};
//     }
//     this.find(filter, select).exec(callback);
// };

// wishlistSchema.statics.getList = function(filter, pg, limit, callback) {
//     let paging = {};
//     if (limit !== null) {
//         paging = { limit: limit, skip: pg };
//     }
//     this.count(filter).exec((err, total) => {
//         if (!!err) {
//             callback(err, 0, []);
//         } else {
//             this.find(filter, {}, paging).sort({ 'createdAt': 1 })
//                 .populate('userId')
//                 .populate('eventId')
//                 .populate('placeId')
//                 .exec(function(err, result) {
//                     callback(err, total, result);
//                 });
//         }
//     });
// };
// wishlistSchema.statics.deleteRecord = function(filter, callback) {
//     this.deleteMany(filter, callback);
// };


let blocuserModel = mongoose.model('blockusers', blockuserSchema);

module.exports = blocuserModel;