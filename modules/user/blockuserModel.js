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
let blocuserModel = mongoose.model('blockusers', blockuserSchema);

module.exports = blocuserModel;