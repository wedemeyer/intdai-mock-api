var _ = require("underscore");
var request = require("request");
var assert = require("assert");
var async = require("async");
var app = null;
var server = null;
var config = require('../config');
var sqlite3 = require('sqlite3');
var validation = require('../lib/validation');
var toCamelCase = require("to-camel-case");
var db = null;

describe('Tests related queries', function() {

  before(function(done) {
    app = require('./../app').create();
    server = app.listen(process.env.PORT || 4730);
    db = new sqlite3.Database(config.test.db.file, sqlite3.OPEN_READONLY);;
    done();
  });

  after(function(done){
    server.close();
    done();
  });

  /****************************************/
  /* Related queries endpoint             */
  /* /related_queries?q=<query>             */
  /****************************************/

  it("Should fetch all queries matching a query", function(done) {
    var tags = ["hello", "kitty"];
    request(app.getBaseUrl(server)+"/related_queries/"+encodeURIComponent(tags.join(" ")), function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      validation.checkSchemaRecursive(require('./schemas/related_queries/relatedQueriesSearchResponse'), JSON.parse(body), function(err) {
        if (!!err) return done(err);
        done();
      });
    });
  });

  var test404ForUrl = function(url) {
    return function(done) {
      url = app.getBaseUrl(server) + url;
      request(url, function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 404, "Unexpected status code " + response.statusCode);
        done();
      });
    }
  }

  it(
    "Should receive a status 404 for missing query parameter", 
    test404ForUrl("/related_queries")
  );

  it(
    "Should receive a status 404 for empty query parameter", 
    test404ForUrl("/related_queries/")
  );

});