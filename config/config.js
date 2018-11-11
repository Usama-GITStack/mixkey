var config = function() {};
config.SECRET = '123@sawhatsup#^5sd34sdf989dkhk21weqksdf{52}{2eghvasaxfj';
config.MAX_RECORDS = 10;
config.bookRecords = 10;
config.MAX_RECORDS_SPECIFIC_MODULE = 200;
config.USER_IMAGE_PATH = "user/";
config.EVENT_IMAGE_PATH = "event/";
config.PLACE_IMAGE_PATH = "place/";
config.FULL_IMAGE_SIZE = 500;
config.THUMB_IMAGE_SIZE = 50;
config.allowedImageFiles = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"];
config.allowedPdfFiles = ["pdf", "PDF"];
config.allowedVideoFiles = ["mp4"];
config.MAX_FILE_UPLOAD_SIZE = 5242880;
config.MAX_DIGIT = 10;
config.AWS_CONFIG = {
    "accessKeyId": process.env.AWS_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_SECRET_KEY,
    "region": process.env.AWS_REGION
};
config.NOTIFICATION_OPTIONS = {
    token: {
        key: process.env.APPLE_KEY, // Path to the key p8 file
        keyId: process.env.keyId, // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
        teamId: process.env.teamId, // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: false // Set to true if sending a notification to a production iOS app
}
config.NO_REPLY = 'donotreply@multikey.com';
config.timeSlote = 30;
config.late = 23.033863;
config.long = 72.585022;
module.exports = config;