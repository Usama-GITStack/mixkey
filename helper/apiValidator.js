let validator = {};

validator.getSelectField = (type) => {
    let select = {
        cuisine: ["cuisineName"],
        foodCategory: ["foodCategoryName"],
        user: ["userId", "firstName", "lastName", "email", "gender", "dob", "imagePath", "originalImagePath", "thumbPath", "videoPath", "intro", "verified", "notificationStatus", "googleId", "fullName", "categories", "country", "city", "height", "weight", "reviews", "isFilledProfile"],
        other: ["userId", "firstName", "lastName", "email", "gender", "dob", "imagePath", "originalImagePath", "thumbPath", "videoPath", "intro", "verified", "googleId", "fullName", "categories", "country", "city", "height", "weight", "reviews", "sessions"],
        installation: ["installationId", "timezone", "appVersion", "buildNumber", "appName", "deviceType", "badge", "appIdentifier", "localeIdentifier", "deviceToken"],
        locality: ["localityName", 'cityId'],
    };
    return select[type];
};

validator.getDefaultSelectField = (type) => {
    let select = {
        user: ["userId", "firstName", "lastName", "email", "gender", "dob", "imagePath", "thumbPath", "videoPath", "intro", "verified", "notificationStatus", "googleId", "fullName", "categories", "country", "city", "height", "weight", "reviews", "isFilledProfile"],
        other: ["userId", "firstName", "lastName", "email", "gender", "dob", "imagePath", "thumbPath", "videoPath", "intro", "verified", "googleId", "fullName", "categories", "country", "city", "height", "weight", "sessions"]
    };
    return select[type];
};

validator.getUpdateField = (type, cb) => {
    let update = {
        cuisine: ["cuisineName", "status", "cuisineId", "language", "data"],
        foodCategory: ["foodCategoryName", "status", "foodCategoryId", "language", "data", "logo"],
        supplierFoodCategory: ["foodCategoryName", "status", "foodCategoryId", "language", "data", "logo"],
        locality: ["localityName", "status", "localityId", "language", "data", "isPopular", "logo", 'cityId'],
        coupon: ["restList", "branchId", "couponName", "description", "couponCode", "discountType", "discount", "allowedAttempt", "validFrom", "validTo", "status", "couponId"],
        customer: ["customerId", "password", "firstName", "lastName", "email", "mobileNo", "gender", "dob", "profilePic", "originalFile", "thumb", "verified", "status", "socialId", "socialType", "fullName"],
        forgotPassword: ["email"],
        settings: ["currentPassword", "newPassword", "notificationStatus"],
        contact: ["questionType", "name", "email", "comments"],
        installation: ["timezone", "appVersion", "buildNumber", "appName", "badge", "appIdentifier", "localeIdentifier", "deviceToken"],
        restaurant: ["restaurantName", "mobileNo", "status", "verified", "buildingNumber", "streetName", "neighbourhood", "city", "postalCode", "additionalNumber", "longitude", "latitude"],
        supplier: ["name", "mobileNo", "password", "oldPassword", "data", "latitude", "longitude", "docFile", "addressId", "cityId"],
        subscription: ["data", "subId", "status", "duration", "noOfBranch", "subscriptionName", "price"],
        subscriptionAssign: ["resId", "subId"],
        organization: ['name', 'email', "role", 'password', "mobileNo", "id", "lastLoggedIn", "status", "verified", "data", "addressId", "latitude", "longitude", "cityId"],
        createPersonTable: ["create"]
    };
    cb(update[type]);
};

module.exports = validator;