let validator = {};
validator.getUserValidator = (req, type) => {
    let input = {
        login: {
            email: ["notEmpty", req.t("USERNAME_REQUIRE")],
            password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
        },
        register: {
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "valid email address" })],
            password: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Password" })],
            userName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "User name" })]
        },
        socialLogin: {
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "email" })],
            socialId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "social Id" })]
        },
        update: {
            email: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "E-mail" })],
            userName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "User name" })]
        },
        sendNotification: {
            userId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "User id" })],
            message: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Message" })],
        },
        getmessage: {
            userId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "User id" })]
        },
        addreview: {
            eventPlaceType: ["isValidEnum", req.t("TYPE_NOT_VALID"), ["event", "place"]],
            id: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "id" })],
            rate: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Rate" })],
            review: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Review" })]
        },
        listReview: {
            eventPlaceType: ["isValidEnum", req.t("TYPE_NOT_VALID"), ["event", "place"]]
        },
        listWhishlist: {
            eventPlaceType: ["isValidEnum", req.t("TYPE_NOT_VALID"), ["event", "place"]]
        },
        statusChange: {
            userId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "User id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]]
        },
        forgotPassword: {
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "valid email address" })]
        },
        resetpassword: {
            oldPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Old password" })],
            newPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "New password" })]
        },
        updatelocation: {
            longitude: ["isFloat", req.t("FIELD_REQUIRED", { FIELD: "longitude" })],
            latitude: ["isFloat", req.t("FIELD_REQUIRED", { FIELD: "latitude" })]
        },
        nearby: {
            longitude: ["isFloat", req.t("FIELD_REQUIRED", { FIELD: "longitude" })],
            latitude: ["isFloat", req.t("FIELD_REQUIRED", { FIELD: "latitude" })],
            // listType: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "listType" })],
            distance: ["isFloat", req.t("FIELD_REQUIRED", { FIELD: "distance" })],
        }
    };
    return input[type];
}

module.exports = validator;