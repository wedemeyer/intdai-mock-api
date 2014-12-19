var _ = require("underscore");
var request = require("request");
var assert = require("assert");
var async = require("async");
var app = null;
var server = null;
var config = require('../config');
var sqlite3 = require('sqlite3');
var validation = require('../lib/validation');
var db = null;

describe('Tests recommendations', function() {

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

  /***********************************/
  /* recommendations lists endpoints */
  /* /recommendations                */
  /***********************************/

  function testLoadRecommendations(cb) {
    request(app.getBaseUrl(server)+"/recommendations", function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      // Verify recommendations page response schema
      validation.checkSchemaRecursive(require('./schemas/recommendations/recommendationsResponse'), JSON.parse(body), cb);
    });
  }

  it("Should fetch the first page of recommendations by tag", function(done) {
    testLoadRecommendations(done);
  });

  function testLoadRecommendationProductsPage(id, cb) {
    request(app.getBaseUrl(server)+"/recommendations/"+id+"/products", function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      // Verify recommendations page response schema
      validation.checkSchemaRecursive(require('./schemas/recommendations/recommendationProductsResponse'), JSON.parse(body), cb);
    });
  }

  it("Should fetch a recommendation's first page of products", function(done) {
    request(app.getBaseUrl(server)+"/recommendations", function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      body = JSON.parse(body);
      var recommendation = body.data[Math.floor((Math.random() * 100) % body.data.length)];
      testLoadRecommendationProductsPage(recommendation.id, done);
    });
  });


});
