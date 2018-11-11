let apiValidator = require('./apiValidator');
let installationModel = require('../modules/systemUser/installationModel');
let utils = require('./utils');

let api = {};

api.parseRequest = (query, type) => {
    var selectData = {};
    selectData['limit'] = null;
    selectData['offset'] = 0
    if (!utils.empty(query)) {
        if (query.fields) {
            selectData['fields'] = _.split(query.fields, ',');
            for (var i in selectData.fields)
                selectData.fields[i] = selectData.fields[i].trim();
            if (selectData['fields'].indexOf("_id") === -1) {
                selectData['fields'].push("-_id");
            }
        }
        selectData['limit'] = query.limit;
        selectData['offset'] = query.offset;
    }
    if (utils.empty(selectData['fields'])) {
        selectData['fields'] = apiValidator.getDefaultSelectField(type);
    }
    return selectData;
};

api.validateSelectField = (type) => {
    return (req, res, next) => {
        var err = "";
        req.selectData = api.parseRequest(req.query, type);
        var selectableField = apiValidator.getSelectField(type);
        if (!utils.empty(req.selectData.fields)) {
            _(req.selectData.fields).forEach((select) => {
                if (select == ("-_id")) {
                    return;
                }
                if (selectableField.indexOf(select) === -1) {
                    err += req.t("NOT_SELECTABLE_FIELD", { field: select });
                }
            });
        }
        if (err) {
            return res.status(400).send(err);
        }
        next();
    }
};

api.validateUpdateField = (type) => {
    return (req, res, next) => {
        console.log(type);
        console.log('type..........');
        console.log(req.role);
        console.log('req.role......');
        if (!utils.empty(type)) {
            if (type == 'user')
                type = req.role;
            var err = "";
            var inputFiled = _.keys(req.body);
            var inputFiles = _.keys(req.files);
            apiValidator.getUpdateField(type, (editableField) => {
                if (inputFiles.length > 0) {
                    inputFiles.forEach((input) => {
                        if (editableField.indexOf(input) === -1) {
                            err = req.t("NOT_EDITABLE_FIELD", { field: input });
                        }
                    });
                }
                if (inputFiled.length > 0) {
                    inputFiled.forEach((input) => {
                        if (editableField.indexOf(input) === -1) {
                            err = req.t("NOT_EDITABLE_FIELD", { field: input });
                        }
                    });
                } else {
                    if (inputFiles.length < 1)
                        return res.status(400).send(req.t("NOT_EDITABLE_FIELD"));
                }
                if (err) {
                    return res.status(400).send(err);
                }
                next();
            });
        } else {
            return res.status(400).send(req.t("NOT_EDITABLE_FIELD"));
        }
    }
};

api.detail = (data, selectData) => {
    var detail = {};
    _(selectData).forEach((val) => {
        detail[val] = data[val];
    });
    return detail;
};

api.installation = (req, res, next) => {
    if (!utils.empty(req.authUserInstallationId)) {
        installationModel.getTimezone(req.authUserInstallationId, (installation) => {
            if (installation) {
                req.authUserTimezone = installation[0].timezone;
            } else {
                req.authUserTimezone = "UTC";
            }
            next();
        });
    }
};

module.exports = api;
