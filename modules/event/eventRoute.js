//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const eventCtr = require('./eventController');
const eventMiddleware = require('./eventMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

let eventRouter = express.Router();

/**
 * @apiDefine ErrorAllRequired
 * @apiErrorExample Error: 400
 *     HTTP/1.1 400 Bad Input
 *       Please enter all the required fields.
 */

/**
 * @apiDefine TokenHeader
 * @apiHeader {String} x-auth-token event's authorization token that you received at the time of registration or login
 * @apiHeaderExample {json} Header-Example
 *   {
 *     "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1NmRmZjAyNWI4ZWQwOWRkMmM4MmQxNjEifQ.KWW2fODqlIFkJXyzwXSSyq7SkERBdA9B1bcO2AUo8C0"
 *   }
 */

/**
 * @apiDefine eventNotAuthorized
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
 * @api {post} /event/create Create event
 * @apiName Create new event
 * @apiGroup event
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] event's full name.
 * @apiParam {String} email event's unique email address.
 * @apiParam {String} eventName event's unique email address.
 * @apiParam {String} password event's password.
 * @apiParam {Number} gender event's gender.
 * @apiParam {String} [profilePic] event's profilePic.
 * @apiParam {String} [description] event's description.
 * @apiParam {String} [installationId] event's Device Installation ID.
 * @apiVersion 1.0.0

 * @apiError 400 Bad event Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let createMiddleware = [multipartMiddleware, auth.isAuthenticatedUser, eventMiddleware.validateInput('create'), eventMiddleware.checkImage, eventMiddleware.titleExists, eventMiddleware.checkDate, eventCtr.createEvent];
eventRouter.post('/create', createMiddleware);

/**
 * @api {post} /event/update Update event
 * @apiName Update event profile
 * @apiGroup event
 * @apiUse TokenHeader
 * @apiParam {String} [fullName] event's full name.
 * @apiParam {String} [email] event's unique email address.
 * @apiParam {String} [mobileNo] event's mobile Number.
 * @apiParam {String} [profilePic] event's profilePic.
 * @apiParam {String} [description] event's profilePic.
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *      "event profile successfully updated."
 * @apiError 400 Bad event Input
 * @apiUse ErrorAllRequired
 * @apiUse ServerError
 */

let updateeventsMiddleware = [multipartMiddleware, auth.isAuthenticatedUser, eventMiddleware.validateInput('update'), eventMiddleware.titleExists, eventMiddleware.checkDate, eventCtr.updateEvent];
eventRouter.post('/update', updateeventsMiddleware);

/**
 * @api {post} /event/eventList/:pg Get eventList
 * @apiName Get event
 * @apiGroup event
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let geteventsMiddleware = [auth.isAuthenticatedUser, eventCtr.getEventList];
eventRouter.post('/eventList', geteventsMiddleware);

/**
 * @api {post} /event/eventList/Active Get eventList
 * @apiName Get event
 * @apiGroup event
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let geteventsActiveMiddleware = [auth.isAuthenticatedUser, eventCtr.getActiveEventList];
eventRouter.post('/activeEventList', geteventsActiveMiddleware);

/**
 * @api {post} /event/deleteevent delete event
 * @apiName delete event
 * @apiGroup event
 * @apiUse TokenHeader
 * @apiVersion 1.0.0
 * @apiParam {Number} [pg] page number.
 * @apiParam {Number} [status] status (ACTIVE/INACTIVE).
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 * @apiUse ServerError
 */

let deleteEventMiddleware = [multipartMiddleware, auth.isAuthenticatedUser, eventMiddleware.validateId, eventCtr.deleteEvent];
eventRouter.post('/deleteEvent', deleteEventMiddleware);

eventRouter.post('/eventById',eventCtr.getEventById);

module.exports = eventRouter;
