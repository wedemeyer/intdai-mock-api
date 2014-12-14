var config = require('./config');
var express = require('express');
var sqlite3 = require('sqlite3');

exports.create = function() {
    app = express();

    app.db = new sqlite3.Database(config.production.db.file, sqlite3.OPEN_READONLY);

    app.exclude = function (json, path) {
        if (path.length == 0) return json;
        var jsonCopy = JSON.parse(JSON.stringify(json));
        var pathComponents = path.split(".");
        if (pathComponents.length == 1 && !(json instanceof Array)) {
            delete jsonCopy[pathComponents[0]];
            return jsonCopy;
        }
        if (json instanceof Array) {
            for (var j=0; j<json.length; j++) {
                jsonCopy[j] = arguments.callee(json[j], path);
            }
            return jsonCopy;
        } else if (typeof(json) == "object") {
            pathComponentsCopy = JSON.parse(JSON.stringify(pathComponents));
            pathComponentsCopy.shift();
            jsonCopy[pathComponents[0]] = arguments.callee(json[pathComponents[0]], pathComponentsCopy.join("."));
            return jsonCopy;
        } else {
            return jsonCopy;
        }
    }

    app.limitResponse = function (req, data) {
      if (req.query._exclude != undefined) {
        var excludes = req.query._exclude.split(",");
        for (var i=0; i<excludes.length;i++) {
          var ex = excludes[i];
          data = app.exclude(data, ex);
        }
      }
      return data;
    }

    app.getBaseUrl = function (server) {
        return "http://" + server.address().address + ":" + server.address().port;
    }

    require('./routes').route(app);

    return app;
}