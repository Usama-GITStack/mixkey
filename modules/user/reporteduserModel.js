let mongoose = require('mongoose');
let utils = require("../../helper/utils");

let schema = mongoose.Schema;

let reportuserSchema = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: 'userId',
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});



let reportuserModel = mongoose.model('reportedusers', reportuserSchema);

module.exports = reportuserModel;