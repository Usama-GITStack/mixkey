const fs = require('fs');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const path = require('path');
const async = require('async');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const url = require('url');
const https = require('https');
const sizeOf = require('image-size');

let utils = {};
utils.ROLES = {
    "AUTHOR": 2,
    'ADMIN': 1
};

utils.status = ['ACTIVE', 'INACTIVE'];

utils.base64FileRegex = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
utils.isDefined = (variable) => {
    if (typeof variable == 'boolean') return true;
    return (typeof variable !== undefined && variable != null && variable != "");
}
utils.empty = (mixedVar) => {
    let undef, key, i, len;
    let emptyValues = ["undefined", null, false, 0, '', '0', undefined];
    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixedVar === emptyValues[i]) {
            return true;
        }
    }
    if (typeof mixedVar === 'object') {
        for (key in mixedVar) {
            return false;
        }
        return true;
    }

    return false;
}
utils.dataEncrypt = (text) => {
    let cipher = crypto.createCipher(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_PASSWORD)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

utils.dataDecrypt = (text) => {
    let decipher = crypto.createDecipher(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_PASSWORD);
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

// utils.sendEmail = (toEmail, subject, body, replyTo, callback) => {
//     // load AWS SES
//     let SES_CONFIG = config.AWS_CONFIG;
//     SES_CONFIG = _.extend(SES_CONFIG, { apiVersion: '2010-12-01' });
//     let ses = new AWS.SES(SES_CONFIG);

//     if (typeof replyTo === 'function' && !callback) {
//         callback = replyTo;
//         replyTo = "";
//     }

//     // send to list
//     let to = [toEmail];

//     // this must relate to a verified SES account
//     let from = config.NO_REPLY;

//     let reply_to = !utils.empty(replyTo) ? replyTo : config.NO_REPLY;

//     // this sends the email
//     // @todo - add HTML version
//     ses.sendEmail({
//         Source: from,
//         Destination: { ToAddresses: to },
//         ReplyToAddresses: [reply_to],
//         Message: {
//             Subject: {
//                 Data: subject
//             },
//             Body: {
//                 Html: {
//                     Data: body,
//                 }
//             }
//         }
//     }, (error, data) => {
//         console.log(error);
//         console.log(data);
//         if (error) {
//             isEmailSent = false;
//         } else {
//             isEmailSent = true;
//         }
//         // To be changed when we have proper credentials ------- CHANGE THIS -------
//         isEmailSent = true;
//         error = "";
//         callback(error, isEmailSent);
//     });
//     // callback("", true);
// }

utils.sendEmail = (toEmail, subject, body, callback) => {
    // sendEmail: function(toEmail, subject, body, callback) {
    let currentYear = (new Date()).getFullYear();
    body = body.replace(new RegExp("{CURRENTYEAR}", 'g'), currentYear);
    let options = {
        auth: {
            api_user: '',
            api_key: ''
        }
    }
    // createTransport({ host: "smtp.gmail.com", port: 587, auth: { user: "username@gmail.com", pass: "app password" } });
    let transporter = nodemailer.createTransport({
        service: 'multikey.app',
        // service: 'gmail',
        port: 25,
        auth: {
            user: 'notifications@multikey.app',
            pass: 'vNe2l16_'
        }
    });
    //smtpTransport = nodemailer.createTransport('smtps://murtu@suitenomics.com:g@KFyt34e@smtp.gmail.com');
    smtpTransport = nodemailer.createTransport(sgTransport(options));
    let isEmailSent = false;
    let from_ = config.NO_REPLY;
    transporter.sendMail({
        from: from_,
        to: toEmail,
        subject: subject,
        html: body.toString()
    }, function(error, response) {
        if (error) {
            console.log(error);
            isEmailSent = false;
            error = error;
        } else {
            console.log('mail sent....');
            isEmailSent = true;
            error = "";
        }
        callback(error, isEmailSent);
    });
}

utils.resize = (file, type, imagePath, userId, userThumbDir, requiredSize, cb) => {
    // console.log("resizeUserIcon");
    let currentFile = utils;
    // let imagePath = config.AWS_URL + config.ADVT_IMAGE_PATH + fileName;

    let options = url.parse(imagePath);
    https.get(options, function(response) {
        let chunks = [];

        response.on('data', function(chunk) {
            chunks.push(chunk);
        }).on('error', function(resp) {
            console.log(resp);
        }).on('end', function() {
            //console.log(chunks)
            let buffer = Buffer.concat(chunks);
            // dimensions.push(Buffer.concat(chunks));
            let dimensions = sizeOf(buffer);
            // console.log(dimensions);
            if (dimensions.width > requiredSize && dimensions.height > requiredSize) {
                gm(buffer).size(function(err, size) {
                    if (err) {
                        console.log("err...in image resize.......", err);
                        cb(err);
                    } else {
                        let MAX_WIDTH = requiredSize;
                        let MAX_HEIGHT = requiredSize;
                        // Infer the scaling factor to avoid stretching the image unnaturally.
                        let scalingFactor = Math.max(
                            MAX_WIDTH / size.width,
                            MAX_HEIGHT / size.height
                        );
                        let width = scalingFactor * size.width;
                        let height = scalingFactor * size.height;

                        // Transform the image buffer in memory.
                        this.resize(width, height)
                            .toBuffer(imagePath.substr(imagePath.lastIndexOf('.')), function(err, buffer) {
                                if (err) {
                                    console.log('err............in resize function cb');
                                    console.log(err);
                                    cb(err);
                                } else {
                                    currentFile.uploadFileToBuckets(buffer, dimensions.type, imagePath.substr(imagePath.lastIndexOf('.')), userId, userThumbDir, (savedFile) => {
                                        // console.log("uploadUserIcon done");
                                        // console.log(savedFile);
                                        cb(savedFile);
                                    });
                                }
                            });
                    }
                });
            } else {
                let dataFile = "data:" + dimensions.type + ";base64," + buffer.toString('base64');
                currentFile.uploadFile([dataFile], userId, userThumbDir, "data", (savedFile) => {
                    cb(savedFile);
                });
            }
        });
    });
}

utils.uploadFileToBuckets = (file, type, extension, referenceId, storagePath, cb) => {
    let configS3 = config.AWS_CONFIG;
    let response = { "data": [], "error": "" };
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    // console.log("load resize upload done");
    // console.log("-------------------------");
    // console.log(file);
    let newFilename = referenceId + "_" + Date.now() + extension;
    let newPath = storagePath + newFilename;
    let base64data = new Buffer(file, 'binary')
    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: newPath,
        Body: base64data,
        ACL: 'public-read',
        ContentType: type
    };
    s3.putObject(params, (err, res) => {
        // console.log(err, res);
        if (utils.isDefined(err)) {
            response.error = err;
        } else {
            response.data.push(newFilename);
        }
        cb(response);
    });
}

utils.uploadFile = (file, storagePath, type, cb) => {
    let files = file;
    let currentFile = utils;
    let response = { "data": [], "error": "" };
    let fileData = [];
    let configS3 = config.AWS_CONFIG;
    // configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    if (type == "files") {
        for (var key in files) {
            let file = files[key];
            let oldFilename = file.path;
            let fileName = file.name;
            let extension = path.extname(fileName);
            let baseFileName = path.basename(fileName, extension);
            let newFilename = baseFileName + "_" + (key + 1) + "_" + Date.now() + extension;
            let newPath = storagePath + newFilename;
            let data = fs.readFileSync(oldFilename);
            fileData.push({
                "data": data,
                "type": file.type,
                "name": newFilename,
                "path": newPath
            });
            fs.unlink(file.path, (err) => {
                console.log(err);
            });
        }
    } else {
        for (var key in files) {
            let file = files[key];
            let data = currentFile.decodeBase64File(file);
            let type_ = utils.empty(data.extension) ? data.type : data.extension;
            let newFilename = (key + 1) + "_" + Date.now() + "." + type_;
            let newPath = storagePath + newFilename;
            fileData.push({
                "data": data.data,
                "type": data.type,
                "name": newFilename,
                "path": newPath
            });
        }
    }
    if (fileData.length > 0) {
        async.eachSeries(fileData, (file, callback) => {
            let params = {
                Bucket: process.env.BUCKET_NAME,
                ACL: 'public-read',
                Body: file.data,
                Key: file.path,
                ContentType: file.type
            };
            s3.putObject(params, (err, res) => {
                console.log(err);
                console.log(res);
                if (utils.isDefined(err))
                    response.error = err;
                response.data.push(file.name);
                callback();
            });
        }, (err) => {
            console.log(err);
            console.log(response);
            cb(response);
        });
    } else {
        cb(response);
    }
    //cb(response);
}

utils.uploadImage = (file, storagePath, type, cb) => {
    let currentFile = utils;
    let urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    let returnResponse = (file, type) => {
            currentFile.uploadFile(file, storagePath, type, cb);
        }
        // return cb({data: [], error: ''});
    if (typeof file[0] === 'string' && file[0].match(urlPattern)) {
        let options = url.parse(file[0]);
        https.get(options, function(response) {
            let chunks = [];

            response.on('data', function(chunk) {
                chunks.push(chunk);
            }).on('error', function(resp) {
                console.log(resp);
            }).on('end', function() {
                let buffer = Buffer.concat(chunks);

                let dimensions = sizeOf(buffer);
                let dataFile = "data:" + dimensions.type + ";base64," + buffer.toString('base64');
                type = "";
                returnResponse([dataFile], type);
            });
        });
    } else {
        returnResponse(file, type);
    }
}

utils.deleteImage = (path, callback) => {
    let configS3 = config.AWS_CONFIG;
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    s3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: path
    }, callback);
}

utils.getExtension = (fileName) => {
    let ext = path.extname(fileName || '').split('.');
    return ext[ext.length - 1];
}

utils.decodeBase64File = (dataString) => {
    let currentFile = this;
    let matches = dataString.match(utils.base64FileRegex),
        response = {};
    if (!matches || (matches.length !== 3)) {
        return new Error('File data is invalid.');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let type = response.type.split('/');
    response.extension = type[1];

    return response;
}

utils.checkValidImageFile = (file, req) => {
    let error = "";
    let fileName = file.name;
    let extension = utils.getExtension(fileName);
    let baseFileName = path.basename(fileName, extension);
    let allowExtension = config.allowedImageFiles;

    if (file.size > config.MAX_FILE_UPLOAD_SIZE) {
        error = req.t("IMAGE_LARGE");
    } else if (allowExtension.indexOf(extension.toLowerCase()) == -1) {
        error = req.t("IMAGE_NOT_VALID");
    }
    return error;
}

utils.checkValidPdfFile = (file, req) => {
    let error = "";
    let fileName = file.name;
    let extension = utils.getExtension(fileName);
    let baseFileName = path.basename(fileName, extension);
    let allowExtension = config.allowedPdfFiles;

    // if (file.size > config.MAX_FILE_UPLOAD_SIZE) {
    //     error = req.t("IMAGE_LARGE");
    // } else
    if (allowExtension.indexOf(extension.toLowerCase()) == -1) {
        error = req.t("PDF_NOT_VALID");
    }
    return error;
}

utils.deleteFile = (oldData) => {
    var configS3 = config.AWS_CONFIG;
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    var s3 = new AWS.S3(configS3);
    var params = {
        Bucket: process.env.BUCKET_NAME
    };
    _(oldData).forEach((data) => {
        params.Key = data.replace(process.env.S3_BASE_URL + process.env.BUCKET_NAME + '/', '');
        console.log(params);
        s3.deleteObject(params, function(err, data) {});
    });
}

utils.getHtmlContent = (filePath, callback) => {
    let content = "";
    fs.readFile(filePath, 'utf8', (err, html) => {
        console.log(err);
        if (!err) {
            content = html;

        }
        callback(null, content);

    });
}

//generate randome string
utils.getRandomString = (length) => {
    let result = '';
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

utils.capitalizeFirstLetter = (inStr) => {
    if (utils.empty(inStr))
        return inStr;

    return inStr.replace(/\w\S*/g, (tStr) => {
        return tStr.charAt(0).toUpperCase() + tStr.substr(1).toLowerCase();
    });
}

utils.uploadImageInServer = (file, path, old_path, callback) => {

    let imagePath = file.path;
    let imageName = Date.now() + Math.floor(Math.random() * (1 - 99999999999 + 1)) + 9999999999999 + file.name;
    fs.readFile(imagePath, function(err, data) {
        if (!utils.empty(err)) {
            callback(err, null);
        } else {
            fs.writeFile(path + "/" + imageName, data, function(err1) {
                if (!utils.empty(err1)) {
                    callback(err1, null);
                } else {
                    if (!utils.empty(old_path)) {
                        fs.unlink(old_path, function(err2) {
                            if (!utils.empty(err2)) {
                                callback(null, imageName);
                            } else {
                                callback(null, imageName);
                            }
                        });
                    } else {
                        callback(null, imageName);
                    }
                }
            });
        }
    });
};

// utils.generatePDF = (actualData, template, fileName, filePath, callback) => {
//     utils.getHtmlContent(template, (err, content) => {
//         Handlebars.registerHelper('getValue', function(value, options) {
//             let returnValue = value;
//             let keys = options.hash;
//             for (var prop in keys) {
//                 console.log(returnValue[keys[prop]]);
//                 returnValue = returnValue[keys[prop]];
//             }
//             if (typeof returnValue == 'object') {
//                 return JSON.stringify(returnValue);
//             } else {
//                 return returnValue;
//             }
//         });
//         Handlebars.registerHelper('getArray', function(value, options) {
//             let returnValue = value;
//             let keys = options.hash;
//             for (var prop in keys) {
//                 returnValue = returnValue[keys[prop]];
//             }
//             return returnValue;
//         });
//         let template = Handlebars.compile(content);
//         let result = template(actualData);
//         PDFDocument.create(result, {
//             format: 'A4'
//         }).toBuffer(function(err, buffer) {
//             let params = {
//                 Bucket: process.env.BUCKET_NAME,
//                 ACL: 'public-read',
//                 Body: buffer,
//                 Key: filePath,
//                 ContentType: 'application/pdf'
//             };
//             let configS3 = config.AWS_CONFIG;
//             configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
//             let s3 = new AWS.S3(configS3);
//             s3.putObject(params, (err, res) => {
//                 let success = true;
//                 if (utils.isDefined(err)) {
//                     success = false;
//                 }
//                 callback(success);
//             });
//         });
//     });
// }

module.exports = utils;



// get pagination