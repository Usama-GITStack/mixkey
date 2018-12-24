let validator = {};
validator.getEventValidator = (req, type) => {
    let input = {
        create: {
            title: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Title" })],
            description: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Description" })],
            eventStartDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event start date" })],
            // startDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event start date" })],
            eventEndDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event end date" })],
            eventFee: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event fee" })],
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