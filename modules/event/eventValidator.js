let validator = {};
validator.getEventValidator = (req, type) => {
    let input = {
        create: {
            title: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Title" })],
            description: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Description" })],
            startDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Evemnt start date" })],
            endDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Evemnt end date" })],
            eventFee: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Evemnt fee" })],
            location: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Location" })],
            latitude: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Latitude" })],
            longitude: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Longitude" })],
            learningLanguage: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Learning language" })]
        },
        update: {
            eventId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event id" })],
        },
        addreview: {
            eventId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event id" })],
            review: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Review" })]
        }
    };
    return input[type];
}

module.exports = validator;