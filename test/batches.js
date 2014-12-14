var request = require("request");
var assert = require("assert");
var async = require("async");
var app = null;
var server = null;
var config = require('../config');
var sqlite3 = require('sqlite3');
var validation = require('../lib/validation');

describe('Tests', function() {

  before(function(done) {
    app = require('./../app').create();
    server = app.listen(process.env.PORT || 4730);
    done();
  });

  after(function(done){
    server.close();
    done();
  });

  /****************************************/
  /* Batch endpoint                       */
  /* /_batches?urls[]=<url>[&urls[]=<url>]+ */
  /****************************************/

  it("Should respond with their individual results", function(done) {
    var baseUrl = app.getBaseUrl(server);
    var requestsUrls = [
      baseUrl + "/teasers/banner",
      baseUrl + "/teasers/tile"
    ];
    var url = baseUrl + "/batches";
    requestsUrls.forEach(function(reqUrl) {
      url += (url == baseUrl + "/batches" ? "?" : "&") + "urls[]=" + encodeURIComponent(reqUrl);
    });
    request(url, function(err, resp, body) {
      assert(!err, "Unexpected error for batches request `" + err + "`");
      assert(resp.statusCode == 200, "Unexpected status code for batches request " + resp.statusCode);
      body = JSON.parse(body);
      validation.checkSchemaRecursive(require('./schemas/batches/batchesResponse'), body, function(err) {
          if (!!err) return done(err);
          async.each(requestsUrls, function(url, cb) {
            var expectedResponse = body.data[requestsUrls.indexOf(url)];
            request(url, function(err, resp, body) {
              assert(!err, "Unexpected error for request to " + url + " `" + err + "`");
              assert(resp.statusCode == expectedResponse.statusCode, "Unexpected status code for request to " + url 
                + ": " + resp.StatusCode + ". Expected " + expectedResponse.statusCode);
              assert.deepEqual(JSON.parse(body), expectedResponse.body, "Unexpected response body for request to " + url 
                + ": " + body + ". Expected " + JSON.stringify(expectedResponse.body));
              cb();
            });
          }, done);
        });
    });
  });

  it("Should respond with an error if there an URL is not supported", function(done) {
    done();
  });

});