let fs = require('fs');
let mongoose = require('mongoose');
let utils = require("../../helper/utils");
let userUtils = require("./userHelper");
let schema = mongoose.Schema;

let encryptProperty = function(value) {
    return !utils.empty(value) ? utils.dataEncrypt(value) : "";
};

let decryptProperty = function(value) {
    return !utils.empty(value) ? utils.dataDecrypt(value) : "";
};

let userSchema = new schema({
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

userSchema.index({
    email: 1,
    "loc": "2dsphere"
}, {
    unique: true
});

/**
 * Methods
 */
userSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     */
    authenticate: function(plainText) {
        console.log(plainText, 'plainText')
        console.log(this.password, 'this.password')
        console.log(utils.dataEncrypt(plainText), 'utils.dataEncrypt(password)')
        return utils.isDefined(plainText) && (this.encryptPassword(plainText) === this.password);
    },
    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     */
    encryptPassword: function(password) {
        return utils.dataEncrypt(password);
    },
    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     */
    decryptPassword: function() {
        return utils.dataDecrypt(this.password);
    }
};

/**
 * Virtuals
 */
userSchema.virtual('imagePath').get(function() {
    return userUtils.getActualImagePath(this.profilePic);
});

// userSchema.virtual('thumbPath').get(function() {
//     return userUtils.getActualThumbImagePath(this.thumb);
// });

// userSchema.virtual('originalImageThumb').get(function() {
//     return userUtils.getOriginalImagePath(this.originalFile);
// });

// userSchema.virtual('videoPath').get(function() {
//     return userUtils.getActualVideoPath(this.profileVideo);
// });

userSchema.virtual('userId').get(function() {
    return this._id;
});


userSchema.statics.getNearby = function(input, callback) {
    console.log(input);
    let milesToRadian = function(km) {
        let miles = km * 0.621371;
        var earthRadiusInMiles = 3963.2;
        return earthRadiusInMiles;
    };
    let query = {};
    query.status = 'ACTIVE';
    query.loc = {
        $geoWithin: {
            $centerSphere: [
                [input.longitude, input.latitude], milesToRadian(input.distance)
                
            ]
        }
    }
    if (!utils.empty(input.practiceLanguage) && input.practiceLanguage.length > 0 && typeof input.practiceLanguage === 'object') {
        console.log("practice filter"); 
        // query["practiceLanguage.language"] = { "$in": input.practiceLanguage};
        
        query["practiceLanguage.language"] = { $regex: new RegExp('^' + input.practiceLanguage, 'i') };
        
    }
    if (!utils.empty(input.nativeLanguage) && input.nativeLanguage.length > 0) {
        
        // query.nativeLanguage = {
        //     "$in": input.nativeLanguage
        // };
        query.nativeLanguage = { $regex: new RegExp('^' + input.nativeLanguage, 'i') };
    }
    this.find(query).exec(callback);
};

userSchema.statics.getUserList = function(filter, pg, limit, select = {}, callback) {
    //console.log("getUserList inside....");

    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    let paging = {};
    if (limit !== null) {
        paging = {
            limit: limit,
            skip: pg
        };
    }
    
    this.count(filter).exec((err, total) => {
        this.find(filter, select, paging).exec(function(err, result) {
            
            callback(err, total, result);
        });
    });
};

userSchema.statics.getUserLogin = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

userSchema.statics.getUsers = function(filter, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.find(filter, select).exec(callback);
};

userSchema.statics.getUserById = function(userId, select = {}, callback) {
    let _self = userModel;
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.findOne({
            _id: userId
        }, select)
        .exec(callback);
};

userSchema.statics.getUserByEmail = function(email, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.getUsers({
        "email": email
    }, select, callback);
};


userSchema.statics.load = function(id, select = {}, callback) {
    if (typeof select === 'function' && !callback) {
        callback = select;
        select = {};
    }
    this.findOne({
        _id: id
    }).lean().exec(callback);
};

let userModel = mongoose.model('users', userSchema);
// index errors check
userModel.on('index', function(err) {
    if (err) console.error(err); // error occurred during index creation
});

module.exports = userModel;