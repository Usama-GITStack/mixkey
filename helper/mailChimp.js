let MAILCHIMP_V3 = require('mailchimp-v3-api');
let MAILCHIMP = new MAILCHIMP_V3({
    key: process.env.MAILCHIMP_API_KEY, // mandatory, API key http://kb.mailchimp.com/accounts/management/about-api-keys 
    debug: true, // optional, auto set to false 
    location: 'us16' // optional, one of Mailchimp locations: http://developer.mailchimp.com/status/ example: 'us12'  
});
let mailChimpUtil = {};

mailChimpUtil.addUserToList = function(userData, callback) {
    try {
        // let api = new MailChimpAPI(this.apiKey, { version: process.env.MAILCHIMP_API_VERSION });
        console.log('/lists/' + process.env.MAILCHIMP_LIST_ID);
        MAILCHIMP
            .post('/lists/' + process.env.MAILCHIMP_LIST_ID + '/members', userData).then(function(response) {
                callback(response); // Do something with your data! 
            });
    } catch (error) {
        callback(error.message);
    }
}

module.exports = mailChimpUtil;