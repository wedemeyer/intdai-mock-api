var config = require('./config');
var express = require('express');
var sqlite3 = require('sqlite3');

exports.create = function() {

    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    }; 

    app = express();
    var router = express.Router();

    app.db = new sqlite3.Database(__dirname + "/" + config.production.db.file, sqlite3.OPEN_READONLY);

    app._exclude = function (json, path) {
        if (path.length == 0) return json;
        var jsonCopy = JSON.parse(JSON.stringify(json));
        var pathComponents = path.split(".");
        if (pathComponents.length == 1 && !(json instanceof Array)) {
            delete jsonCopy[pathComponents[0]];
            return jsonCopy;
        }
        if (json instanceof Array) {
            for (var j=0; j<json.length; j++) jsonCopy[j] = arguments.callee(json[j], path);
            return jsonCopy;
        } else if (typeof(json) == "object") {
            // Don't run in this trap! Make sure the key in path actually applies to the inspected object.
            if (!json[pathComponents[0]]) return jsonCopy;
            pathComponentsCopy = JSON.parse(JSON.stringify(pathComponents));
            pathComponentsCopy.shift();
            jsonCopy[pathComponents[0]] = arguments.callee(json[pathComponents[0]], pathComponentsCopy.join("."));
            // Delete the left-overs, if there are no keys left in the object
            if (JSON.stringify(jsonCopy[pathComponents[0]]) == "{}") delete jsonCopy[pathComponents[0]];
            return jsonCopy;
        } else {
            return jsonCopy;
        }
    }

    app.exclude = function(json, paths) {
        var pathsCopy = JSON.parse(JSON.stringify(paths));
        for (var i=0; i<pathsCopy.length;i++) pathsCopy = app.stripExcludes(pathsCopy[i], pathsCopy);
        for (var i=0; i<pathsCopy.length;i++) json = app._exclude(json, pathsCopy[i]);
        return json;
    }

    app.crawlJsonPaths = function (json, currentPath, paths) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                newCurrentPath = (currentPath == "" ? "" : currentPath + ".") + key;
                paths.push(newCurrentPath);
                if (json[key] instanceof Array) {
                    json[key].forEach(function(entry) {
                        paths.concat(app.crawlJsonPaths(entry, newCurrentPath, paths));
                    });
                    return paths;
                } else if (Object.prototype.toString.call(json[key]) == "[object Object]") {
                    paths.concat(app.crawlJsonPaths(json[key], newCurrentPath, paths));
                }
            }
        }
        return paths;
    }

    app.include = function (json, paths) {
        var jsonPaths = app.crawlJsonPaths(json, "", []);
        var jsonPathsCopy = JSON.parse(JSON.stringify(jsonPaths));
        var deleted = true;
        while (deleted) {
            deleted = false;
            paths.forEach(function(path) {
                jsonPaths.forEach(function(jPath) {
                    if (jPath.indexOf(path) == 0) {
                        jsonPaths.remove(jsonPaths.indexOf(jPath));
                        deleted = true;
                    }
                });
            });
        }
        json = app.exclude(json, jsonPaths);
        return json;
    }

    app.stripExcludes = function (path, excludes) {
        var excludesCopy = JSON.parse(JSON.stringify(excludes));
        if (path.indexOf(".") < 0) return excludesCopy;
        var arr = path.split(".");
        arr.pop();
        path = arr.join(".");
        var idx = excludesCopy.indexOf(path);
        if (idx > -1) excludesCopy.remove(idx);
        return app.stripExcludes(path, excludesCopy);
    }

    app.limitResponse = function (req, data) {
        if (req.query._exclude != undefined) {
            data = app.exclude(data, req.query._exclude.split(","));
        } else if (req.query._include != undefined) {
            data = app.include(data, req.query._include.split(","));
        }
        return data;
    }

    app.getBaseUrl = function (server) {
        return "http://" + server.address().address + ":" + server.address().port;
    }

    require('./routes').route(app, router);

    app.use('/', router);

    return app;
}