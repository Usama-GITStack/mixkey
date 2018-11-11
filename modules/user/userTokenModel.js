let mongoose = require('mongoose');
let utils = require("../../helper/utils");
let userUtils = require("./userHelper");
let schema = mongoose.Schema;

let userTokenSchema = new schema({
    token: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        trim: true
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
 * Virtuals
 */

userTokenSchema.statics.loadData = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

userTokenSchema.statics.deleteToken = function(filter, callback) {
    this.deleteOne(filter, callback);
};

let userTokenModel = mongoose.model('usertokens', userTokenSchema);
// index errors check
userTokenModel.on('index', function(err) {
    if (err) console.error(err); // error occurred during index creation
});

module.exports = userTokenModel;














// const db = require("../../config/database");
// const utils = require('../../helper/utils');
// // const customerModel = require('../customer/customerModel');
// const userModel = require('./userModel');
// const sequelize = db.sequelize;
// const Sequelize = db.Sequelize;

// let userTokens = sequelize.define('usertokens', {
//     id: {
//         type: Sequelize.BIGINT.UNSIGNED,
//         field: 'id',
//         primaryKey: true,
//         autoIncrement: true
//     },
//     customerId: {
//         type: Sequelize.BIGINT.UNSIGNED,
//         references: {
//             // This is a reference to another model
//             model: customerModel,
//             // This is the column name of the referenced model
//             key: 'id'
//         }
//     },
//     userId: {
//         type: Sequelize.BIGINT.UNSIGNED,
//         references: {
//             // This is a reference to another model
//             model: userModel,
//             // This is the column name of the referenced model
//             key: 'id'
//         }
//     },
//     token: {
//         type: Sequelize.TEXT,
//         allowNull: false,
//         field: 'token'
//     },
// }, {
//     updatedAt: false,
//     createdAt: false,
//     freezeTableName: true // Model tableName will be the same as the model name
// });

// /**
//  * static function
//  */
// userTokens.belongsTo(customerModel, { foreignKey: 'customerId' });
// customerModel.hasMany(userTokens, { foreignKey: 'customerId' });
// userTokens.belongsTo(userModel, { foreignKey: 'userId' });
// userModel.hasMany(userTokens, { foreignKey: 'userId' });

// userTokens.createuserTokens = function(createData, success, error) {
//     this.create(createData).then(success).catch(error);
// }

// userTokens.deleteuserTokens = function(filter, success, error) {
//     this.destroy({ where: filter }).then(success).catch(error);
// }

// userTokens.loadData = function(filter, callback, error) {
//     this.findAll({ where: filter }).then(callback).catch(error);
// }

// module.exports = userTokens;