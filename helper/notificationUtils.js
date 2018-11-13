let apns = require("apn");
let utils = require('./utils');
const FCM = require('fcm-push')
let fcm = new FCM(process.env.serverKey);
let notificationUtil = {};
var OneSignal = require('onesignal-node');
var Pusher = require('pusher');
var oneSignalClient = new OneSignal.Client({
  app: { appAuthKey:  process.env.ONESIGNAL_API_KEY, appId: process.env.ONESIGNAL_APP_ID }
});

var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu',
  encrypted: true
});
notificationUtil.getNotificationType = (type) => {
    if (typeof type === "undefined")
        type = "DEFAULT";
    var types = {
        "DEFAULT": 1
    }
    return types[type];
};

notificationUtil.sendPusherNotification = (data, senderId, messageObj) => {
    var channelName = "message_"+senderId + "_" + data.userId;
    var msg = {
            "read": messageObj.read,
            "createdAt": messageObj.createdAt,
            "updatedAt": messageObj.updatedAt,
            "_id": messageObj._id,
            "message": messageObj.message,
            "to": messageObj.to,
            "from": messageObj.from
        }
    pusher.trigger(channelName, 'new-message-sent', {
        'data': msg
    });
};

notificationUtil.createNotification = (data) => {
    var notification = new apns.Notification();
    var payload = {};
    for (var key in data) {
        switch (key) {
            case 'alert':
                notification.alert = data.alert;
                break;
            case 'badge':
                notification.badge = data.badge;
                break;
            case 'sound':
                notification.sound = data.sound;
                break;
            case 'content-available':
                //notification.setNewsstandAvailable(true);
                var isAvailable = data['content-available'] === 1;
                notification.contentAvailable = isAvailable;
                break;
            case 'category':
                notification.category = data.category;
                break;
            case 'topic':
                notification.topic = data.topic;
                break;
            default:
                payload[key] = data[key];
                break;
        }
    }
    notification.payload = payload;
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    return notification;
};

/*
 * Send notifiction to ios
 */
/*
notificationUtil.sendNotification = (data, deviceToken, cb) => {
    if (!utils.empty(deviceToken)) {
        data.topic = process.env.APP_IDENTIFIER;
        var connection = new apns.Provider(config.NOTIFICATION_OPTIONS);
        var notification = notificationUtil.createNotification(data);

        if (!utils.isObject(deviceToken) && utils.isDefined(deviceToken)) {
            deviceToken = [deviceToken];
        }
        if (utils.isObject(deviceToken) && deviceToken.length > 0) {
            connection.send(notification, deviceToken)
                .then((result) => {
                    var successMessage = [];
                    var failureMessage = [];
                    result.sent.forEach((token) => {
                        successMessage.push(token);
                    });
                    result.failed.forEach((failure) => {
                        // A transport-level error occurred (e.g. network problem)
                        failureMessage.push(failure);
                    });
                    if (typeof cb === 'function') {
                        cb(successMessage, failureMessage);
                    } else {
                        console.log("Notification Sent => ");
                        console.log(successMessage);
                        console.log("Notification Failed => ");
                        console.log(failureMessage);
                    }
                });
        }
    }
};
*/

notificationUtil.sendPushNotification = (data, deviceToken, cb) => {
    var firstNotification = new OneSignal.Notification({
        contents: {
            en: "You have received a new message"
        },
        include_player_ids: [deviceToken]
    });

    oneSignalClient.sendNotification(firstNotification, function (err, httpResponse,data) {
       if (err) {
           console.log('Something went wrong...');
       } else {
           console.log(data);
       }
    });
  // var notification = OneSignal.Notification({
  //   contents: {
  //     en: data
  //   },
  //   include_player_ids: [deviceToken],
  // });


  // oneSignalClient.sendNotification(notification, function(err, httpResponse, data) {
  //   if(err){
  //     console.log("err:");
  //     console.log(httpResponse);
  //     console.log(err);
  //   } else {
  //     console.log('sent')
  //   }
  // });
}

/**
 * Android push notification
 * @param {*} data
 * @param {*} deviceToken
 * @param {*} cb
 */
/*
notificationUtil.sendPushNotification = (data, deviceToken, cb) => {
    var message = {
        to: deviceToken, // required fill with device token or topics
        collapse_key: 'your_collapse_key',
        data: {
            your_custom_data_key: 'your_custom_data_value'
        },
        notification: {
            title: data.title,
            body: data.body
        }
    };

    //callback style
    fcm.send(message, cb);
}
*/
module.exports = notificationUtil;
