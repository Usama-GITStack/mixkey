//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const placeCtr = require('./placeController');
const placeMiddleware = require('./placeMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

let placeRouter = express.Router();

/**
 * @apiDefine ErrorAllRequired
 * @apiErrorExample Error: 400
 *     HTTP/1.1 400 Bad Input
 *       Please enter all the required fields.
 */

/**
 * @apiDefine TokenHeader
 * @apiHeader {String} x-auth-token place's authorization token that you received at the time of registration or login
 * @apiHeaderExample {json} Header-Example
 *   {
 *     "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1NmRmZjAyNWI4ZWQwOWRkMmM4MmQxNjEifQ.KWW2fODqlIFkJXyzwXSSyq7SkERBdA9B1bcO2AUo8C0"
 *   }
 */

/**
 * @apiDefine placeNotAuthorized
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


/**
 * @api {post} /place/create Create place
 * @apiName Create new place
 * @apiGroup place
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] place's full name.
 * @apiParam {String} email place's unique email address.
 * @apiParam {String} placeName place's unique email address.
 * @apiParam {String} password place's password.
 * @apiParam {Number} gender place's gender.
 * @apiParam {String} [profilePic] place's profilePic.
 * @apiParam {String} [description] place's description.
 * @apiParam {String} [installationId] place's Device Installation ID.
 * @apiVersion 1.0.0

 * @apiError 400 Bad place Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let createMiddleware = [
    multipartMiddleware,
    placeMiddleware.validateInput("create"),
    placeMiddleware.checkImage,
    placeMiddleware.placeNameExists,
    placeCtr.createPlace
];
placeRouter.post('/create', createMiddleware);

/**
 * @api {post} /place/update Update place
 * @apiName Update place profile
 * @apiGroup place
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] place's full name.
 * @apiParam {String} [email] place's unique email address.
 * @apiParam {String} [mobileNo] place's mobile Number.
 * @apiParam {String} [profilePic] place's profilePic.
 * @apiParam {String} [description] place's profilePic.
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *      "place profile successfully updated."
 * @apiError 400 Bad place Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let updateplacesMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    placeMiddleware.validateInput("update"),
    // placeMiddleware.checkImage,
    placeMiddleware.placeNameExists,
    placeCtr.updatePlace
];
placeRouter.post('/update', updateplacesMiddleware);


/**
 * @api {post} /place/placeList/:pg Get placeList
 * @apiName Get place
 * @apiGroup place
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let getplacesMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    placeCtr.getPlaceList
];
placeRouter.post('/placeList', getplacesMiddleware);

/**
 * @api {post} /place/deletePlace delete Place
 * @apiName delete place
 * @apiGroup place
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let deletePlacesMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    placeMiddleware.validateId,
    placeCtr.deletePlace
];
placeRouter.post('/deletePlace', deletePlacesMiddleware);


placeRouter.post('/placeById',placeCtr.getPlaceById);

module.exports = placeRouter;