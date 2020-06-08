let fs = require('fs');
let mongoose = require('mongoose');
let utils = require("../../helper/utils");
let userUtils = require("./userHelper");
let schema = mongoose.Schema;


let Copy_of_userSchema = new schema({
    fullName: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    userName: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        trim: true
    },
    userRole: {
        type: Number,
        default: 2,
        required: true
    },
    password: {
        type: String,
        set: encryptProperty,
        required: false
    },
    gender: {
        type: Number,
        default: 0,
        required: false
    },
    age: {
        type: Number,
        default: 0,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    profilePic: {
        type: String,
        required: false
    },
    userBio: {
        type: String,
        required: false
    },
    practiceLanguage: [{
        language: {
            type: String
        },
        level:{
            type:String
        }
    }],
    nativeLanguage: {
        type: String,
        required: false
    },
    lastLogin: {
        type: Date,
        required: false
    },
    socialId: {
        type: String,
        required: false
    },
    praticeLangCode: {
        type: String,
        required: false
    },
    nativeLangCode: {
        type: String,
        required: false
    },
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
    isActive: {
        type: Boolean,
        default: false
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

// Copy_of_userSchema.index({
//     email: 1,
//     "loc": "2dsphere"
// }, {
//     unique: true
// });

/**
 * Methods
 */

Copy_of_userSchema.statics.updateFullName = function(callback) {
   
    this.find({'fullName':null}).exec((err,result)=>{
        callback(err,result);
    });
    
    // this.count(filter).exec((err, total) => {
    //     this.find(filter, select, paging).exec(function(err, result) {
            
    //         callback(err, total, result);
    //     });
    // });
};


let userModelcopy = mongoose.model('Copy_of_users', Copy_of_userSchema);
// index errors check
userModelcopy.on('index', function(err) {
    if (err) console.error(err); // error occurred during index creation
});

module.exports = userModelcopy;