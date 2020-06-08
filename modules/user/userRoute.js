//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const userCtr = require('./userController');
const userMiddleware = require('./userMiddleware');
const multer = require('multer');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

let userRouter = express.Router();

/**
 * @apiDefine ErrorAllRequired
 * @apiErrorExample Error: 400
 *     HTTP/1.1 400 Bad Input
 *       Please enter all the required fields.
 */

/**
 * @apiDefine TokenHeader
 * @apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
 * @apiHeaderExample {json} Header-Example
 *   {
 *     "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1NmRmZjAyNWI4ZWQwOWRkMmM4MmQxNjEifQ.KWW2fODqlIFkJXyzwXSSyq7SkERBdA9B1bcO2AUo8C0"
 *   }
 */

/**
 * @apiDefine UserNotAuthorized
 *
 * @apiError 401 Unauthorized
 *
 * @apiErrorExample Error: 401
 *  HTTP/1.1 400 Unauthorized
 *   Unauthorized access.
 */

/**
 *
 * @apiDefine ServerError
 *
 * @apiError 500 Server Error
 *
 * @apiErrorExample Error: 500
 *  HTTP/1.1 500 ServerError
 *   Some error occured. Please try again.
 */


/*Mobile App APIs*/
/**
  * @api {post} /user/login Signin User
  * @apiName Signin
  * @apiGroup user
  * @apiVersion 1.0.0
  * @apiParam {String} email User's unique email.
  * @apiParam {String} password User's password.

  * @apiSuccessExample {json} Success-Response
  *     HTTP/1.1 200 OK
  *     {
  *       "data": {
  *          "id": 1,
  *          "fullName": "Vashram Berani",
  *          "mobileNo": "9016981221",
  *          "email": "admin@gmail.com",
  *          "userRole": 1,
  *          "lastLoggedIn": "2018-01-28T06:57:11.000Z",
  *          "status": "ACTIVE",
  *          "secretToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjEsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIn0.Avv9sBrh_nRjfBEtWh6NUrTcXO4hd4iUdYs0saU54rk"
  *      },
  *      "message": "You have successfully login"
  *  }
  * @apiError 400 Bad User Input
  * @apiUse ErrorAllRequired
  * @apiErrorExample
  *     HTTP/1.1 400 email/password incorrect
  *       Username and password is not valid.
  * @apiErrorExample
  *     HTTP/1.1 400 Password incorrect
  *       Password is incorrect.
  * @apiError 403 Forbidden Access
  * @apiErrorExample 403 Forbidden Access
  *     HTTP/1.1 403 Forbidden Access
  *         Please check email/password combination
  * @apiUse ServerError
 */

let loginMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("login"),
    userCtr.login
];
userRouter.post('/login', loginMiddleware);

/**
  * @api {post} /user/socialLogin social Login
  * @apiName socialLogin
  * @apiGroup customer
  * @apiVersion 1.0.0
  * @apiParam {String} fullName Customer's full name.
  * @apiParam {String} email Customer's email.
  * @apiParam {String} fbid Customer's facebook id.

  * @apiSuccessExample {json} Success-Response
  *     HTTP/1.1 200 OK
  * 	{
  *          "data":[{
  *              "id": 4,
  *              "fullName": "customer name",
  *              "email": "vashramberani+3@gmail.com",
  *              "lastLoggedIn": "2018-02-11T09:33:45.000Z",
  *              "status": "ACTIVE",
  *              "profilePic": "http://localhost:6400/upload/customer/11450807311994g080412_facultyblock01.jpg",
  *              "secretToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQsImVtYWlsIjoidmFzaHJhbWJlcmFuaSszQGdtYWlsLmNvbSJ9.q5UFvDYoK3-jSN5KVXLn3oakDiVuN10uPwGQon2RzH4"
  *          }],
  *          "message": "You have successfully login",
  *          "status": true
  *      }
  * @apiError 400 Bad User Input
  * @apiUse ErrorAllRequired
  * @apiErrorExample 400 Full name required
 *     HTTP/1.1 400 Bad Input
 *         {
 *            "data":[],
 *            "message": "Full name is required",
 *            "status": false
 *         }
 * @apiErrorExample 400 email required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "Please enter email",
 *              "status": false
 *          }
 * @apiErrorExample 400 fbid required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "fbid is required",
 *              "status": false
 *          }
  * @apiUse ServerError
 */

let socialLoginMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("socialLogin"),
    userCtr.socialLogin
];
userRouter.post('/socialLogin', socialLoginMiddleware);

/**
 * @api {post} /user/register Register User
 * @apiName Create new registration
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] User's full name.
 * @apiParam {String} email User's unique email address.
 * @apiParam {String} userName User's unique email address.
 * @apiParam {String} password User's password.
 * @apiParam {Number} gender User's gender.
 * @apiParam {String} [profilePic] User's profilePic.
 * @apiParam {String} [description] User's description.
 * @apiParam {String} [installationId] User's Device Installation ID.
 * @apiVersion 1.0.0

 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let registerMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("register"),
    userMiddleware.emailExists,
    userMiddleware.usernameExists,
    // photoUpload.any('profilePic'),
    userCtr.createUser
];
userRouter.post('/register', registerMiddleware);

/**
 * @api {post} /user/update Update User
 * @apiName Update user profile
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] User's full name.
 * @apiParam {String} [email] User's unique email address.
 * @apiParam {String} [mobileNo] User's mobile Number.
 * @apiParam {String} [profilePic] User's profilePic.
 * @apiParam {String} [description] User's profilePic.
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *      "User profile successfully updated."
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let updateUsersMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    // userMiddleware.validateInput("update"),
    userMiddleware.emailExists,
    userMiddleware.usernameExists,
    // photoUpload.array('profilePic'),
    userCtr.updateUser
];
userRouter.post('/update', updateUsersMiddleware);


/**
 * @api {post} /user/userList/:pg Get userList
 * @apiName Get user
 * @apiGroup user
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let getUsersMiddleware = [
    auth.isAuthenticatedUser,
    userCtr.getUserList
];
userRouter.post('/userList', getUsersMiddleware);



// let getUsersMiddleware = [
//     auth.isAuthenticatedUser,
//     userCtr.getfilteredUserList
// ];
// userRouter.post('/userfilteredList', getUsersMiddleware);


/**
 * @api {post} /user/profile User Profile
 * @apiName User Profile
 * @apiGroup user
 * @apiParam {Number} userId user id.
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *     {
 *           "id": 1,
 *           "fullName": "Vashram berani u",
 *           "mobileNo": "9016981221",
 *           "email": "admin@gmail.com",
 *           "userRole": 1,
 *           "lastLoggedIn": "2018-01-28T15:20:08.000Z",
 *           "status": "ACTIVE",
 *           "profilePic": "http://localhost:6400/upload/user/11497738917006.jpg",
 *           "verified": true
 *       }
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let getProfileMiddleware = [auth.isAuthenticatedUser, userCtr.getProfile];
userRouter.post('/profile', getProfileMiddleware);


/**
 * @api {post} /user/installation installation
 * @apiName installation
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} fullName user's full name.
 * @apiParam {String} email user's email.
 * @apiParam {String} fbid user's facebook id.
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired
 * @apiErrorExample 400 Full name required
 *     HTTP/1.1 400 Bad Input
 *         {
 *            "data":[],
 *            "message": "Full name is required",
 *            "status": false
 *         }
 * @apiErrorExample 400 email required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "Please enter email",
 *              "status": false
 *          }
 * @apiErrorExample 400 fbid required
 *     HTTP/1.1 400 Bad Input
 *         {
 *              "data":[],
 *              "message": "fbid is required",
 *              "status": false
 *          }
 * @apiUse ServerError
 */

let installationMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userCtr.installation
];
userRouter.post('/installation', installationMiddleware);

// userRouter.post('/updateFullname',userCtr.updateFullName);


/**
 * @api {post} /user/sendmsgNotification send message notification(push notification)
 * @apiName send message notification(push notification)
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} fullName user's full name.
 * @apiParam {String} email user's email.
 * @apiParam {String} fbid user's facebook id.
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired

 * @apiUse ServerError
 */

let sendmsgNotificationMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("sendNotification"),
    userCtr.sendmsgNotification
];
userRouter.post('/sendmsgNotification', sendmsgNotificationMiddleware);

/**
 * @api {post} /user/getMessages send message notification(push notification)
 * @apiName send message notification(push notification)
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} fullName user's full name.
 * @apiParam {String} email user's email.
 * @apiParam {String} fbid user's facebook id.
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired

 * @apiUse ServerError
 */

let getMessagesMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("getmessage"),
    userCtr.getMessages
];
userRouter.post('/getMessages', getMessagesMiddleware);

userRouter.post('/getUnreadMessages', userCtr.getUnreadMessages);

/**
 * @api {post} /user/getContactUserList send message notification(push notification)
 * @apiName send message notification(push notification)
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiParam {String} fullName user's full name.
 * @apiParam {String} email user's email.
 * @apiParam {String} fbid user's facebook id.
 * @apiError 400 Bad User Input
 * @apiUse ErrorAllRequired

 * @apiUse ServerError
 */

let getContactUserListMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userCtr.getContactUserList
];
userRouter.post('/getContactUserList', getContactUserListMiddleware);

/**
  * @api {post} /user/forgot-password Forgot Password
  * @apiName Forgot Password
  * @apiGroup user
  * @apiVersion 1.0.0

  * @apiParam {String} email User's email.

  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *         The password fairy sent your password to your email address.

  * @apiError 400 Bad User Input
  * @apiErrorExample 400 Bad User Input
  *     HTTP/1.1 400 Bad Input
  *         Please enter valid email id

  * @apiUse ServerError

 */

let forgotPasswordMiddleware = [
    multipartMiddleware,
    userMiddleware.validateInput("forgotPassword"),
    userCtr.forgotPassword
];
userRouter.post('/forgot-password', forgotPasswordMiddleware);

/**
 * @api {post} /user/addReview event addReview
 * @apiName event addReview
 * @apiGroup event
 * @apiParam {Number} eventId event id.
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK

 * @apiError 400 Bad event Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let addReviewMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("addreview"),
    userMiddleware.idExists,
    userMiddleware.checkreviewExist,
    userCtr.addReview
];
userRouter.post('/addReview', addReviewMiddleware);

//list rate reviews
/**
  * @api {post} /user/listReview list rate reviews
  * @apiName list rate reviews
  * @apiGroup user
  * @apiVersion 1.0.0

  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *
  * @apiError 400 Bad User Input
  * @apiUse ErrorAllRequired
  * @apiUse ServerError
 */

let listRateReviewMiddleware = [
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("listReview"),
    userCtr.listReview
];
userRouter.post('/listReview', listRateReviewMiddleware);

//delete rate reviews
/**
  * @api {post} /user/deleteReview delete rate reviews
  * @apiName delete rate reviews
  * @apiParam {Number} id rate review id
  * @apiGroup user
  * @apiVersion 1.0.0

  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *
  * @apiError 400 Bad User Input
  * @apiUse ErrorAllRequired
  * @apiUse ServerError
 */

let deleteReviewMiddleware = [
    auth.isAuthenticatedUser,
    userMiddleware.reviewIdExists,
    userCtr.deleteReview
];
userRouter.post('/deleteReview', deleteReviewMiddleware);

/**
 * @api {post} /user/addWhishlist event addWhishlist
 * @apiName event addWhishlist
 * @apiGroup event
 * @apiParam {Number} eventId event id.
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK

 * @apiError 400 Bad event Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let addWhishlistMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("addWhishlist"),
    userMiddleware.idExists,
    // userMiddleware.checkWishlistExist,
    userCtr.addWhishlist
];
userRouter.post('/addWhishlist', addWhishlistMiddleware);

/**
 * @api {post} /user/listWhishlist event listWhishlist
 * @apiName event listWhishlist
 * @apiGroup event
 * @apiParam {Number} eventId event id.
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK

 * @apiError 400 Bad event Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let listWhishlistMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput("listWhishlist"),
    userMiddleware.userIdExists,
    userCtr.listWhishlist
];
userRouter.post('/listWhishlist', listWhishlistMiddleware);

/**
  * @api {post} /user/resetpassword Reset user passsword
  * @apiName ResetPasssword
  * @apiGroup user
  * @apiVersion 1.0.0
  * @apiParam {String} oldPassword User's old password.
  * @apiParam {String} newPassword User's new password.

  * @apiSuccessExample {json} Success-Response
  *     HTTP/1.1 200 OK
  * @apiError 400 Bad User Input
  * @apiUse ErrorAllRequired
  * @apiErrorExample
  *     HTTP/1.1 400 old Password required
  *      Old password requird.
  * @apiErrorExample
  *     HTTP/1.1 400 new Password required
  *       New password required.
  * @apiErrorExample
  *     HTTP/1.1 400 old password incorrect
  *       Old password incorrect.
  * @apiUse ServerError
 */

let resetpasswordMiddleware = [
    userMiddleware.validateInput("resetpassword"),
    auth.isAuthenticatedUser,
    userCtr.resetPassword
];
userRouter.post('/resetpassword', resetpasswordMiddleware);

/**
 * @api {post} /user/statusChange Post change status of user
 * @apiName Post change status of user
 * @apiGroup user
 * @apiVersion 1.0.0
 * @apiUse TokenHeader
 * @apiParam {Number} userId user id.
 * @apiParam {Number} status status like ["ACTIVE", "INACTIVE"].
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *    "Status has been changed."
 * @apiErrorExample  Please provide valid status
 *     HTTP/1.1  400 Bad
 *    "Please provide valid status"
 * @apiUse ServerError
 */

let statusChangeMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    userMiddleware.validateInput('statusChange'),
    userMiddleware.ckeckUserId,
    userCtr.statusChange
];
userRouter.post('/statusChange', statusChangeMiddleware);



/**
  * @api {post} /user/verify/:hash Verify User
  * @apiName Verify User
  * @apiGroup user
  * @apiVersion 1.0.0

  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *         The password fairy sent your password to your email address.

  * @apiError 400 Bad User Input
  * @apiErrorExample 400 Bad User Input
  *     HTTP/1.1 400 Bad Input
  *         Please enter valid email id

  * @apiUse ServerError

 */

let verifyMiddleware = [auth.verifyHash, userCtr.verify];
userRouter.post('/verify/:hash', verifyMiddleware);


/**
  * @api {post} /user/logout Logout
  * @apiName Logout
  * @apiGroup user
  * @apiVersion 1.0.0
  *
  * @apiUse TokenHeader
  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *     {
  *      "data":[],
  *      "status": true,
  *      "message": "You have successfully logout"
  *      }
  *
  * @apiError 400 Bad User Input
  * @apiUse ServerError

 */

let logoutMiddleware = [auth.isAuthenticatedUser, userCtr.logout];
userRouter.post('/logout', logoutMiddleware);

let dashboardMiddleware = [auth.isAuthenticatedUser, userCtr.dashboard];
userRouter.post('/dashboard', dashboardMiddleware);

userRouter.post('/blockuser', userCtr.blockUser);

userRouter.post('/getblockuser', userCtr.getBlockedUsers);

userRouter.post('/removeblockuser', userCtr.removeBlockedUsers);

userRouter.post('/reportUser',userCtr.reportUser);

let nearbyMiddleware = [auth.isAuthenticatedUser, userMiddleware.validateInput('nearby'), userCtr.nearby];
userRouter.post('/nearby', nearbyMiddleware);

let updatelocationMiddleware = [multipartMiddleware, auth.isAuthenticatedUser, userMiddleware.validateInput('updatelocation'), userCtr.updatelocation];
userRouter.post('/updatelocation', updatelocationMiddleware);


module.exports = userRouter;