let validator = {};
validator.getPlaceValidator = (req, type) => {
    let input = {
        create: {
            placeName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Place name" })],
            placeTitle: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Place title" })],
            description: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Description" })],
            location: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Location" })],
            latitude: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Latitude" })],
            longitude: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Longitude" })],
            languages: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Languages" })]
        },
        update: {
            placeId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Place id" })],
        }
    };
    return input[type];
}

module.exports = validator;