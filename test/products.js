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
var DEFAULT_LIMIT = 30;

describe('Tests products', function() {

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
  /* Categories endpoint                  */
  /* /products?q=<query>                  */
  /****************************************/

  var getTotalCountHeader = function(resp) {
    return resp.headers["X-Total-Count"]||resp.headers["x-total-count"];
  }

  var testFirstPageWithDirectives = function(offset, limit, handler) {
    return function(done) {
      var tags = ["hello", "kitty"];
      var url = app.getBaseUrl(server)+"/products?q="+encodeURIComponent(tags.join(" "));
      if (!!offset) url += "&offset=" + offset;
      if (!!limit) url += "&limit=" + limit;
      request(url, handler(done));
    }
  }

  var successSchemaValidator = function(done) {
    return function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      var countHeader = getTotalCountHeader(response);
      assert(!!countHeader, "Missing total count header field in request response");
      assert(countHeader.match(/\d+/), "Invalid total count header field `"+countHeader+"` in request response");
      body = JSON.parse(body);
      var schema = require('./schemas/products/productsSearchResponse');
      validation.checkSchemaRecursive(schema, body, function(err) {
        if (!!err) return done(err, null);
        done(null, body);
      });    
    }    
  }

  var testEmptyForUrl = function(url) {
    return function(done) {
      url = app.getBaseUrl(server) + url;
      request(url, function(error, response, body) {
        var countHeader = getTotalCountHeader(response);
        var totalCount = parseInt(countHeader);
        assert(totalCount == 0, "Unexpected total count header greater than 0");
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
        assert(body == "{\"data\":[]}", "Unexpected body: " + body + ". Expected empty list body.");
        done();
      });
    }
  }

  it(
    "Should fetch an empty result set for missing query parameter", 
    testEmptyForUrl("/products")
  );

  it(
    "Should fetch an empty result set for empty query parameter", 
    testEmptyForUrl("/products?q=")
  );

  it(
    "Should fetch first page of products matching a query "
    + "w/ default page size w/o page directives given", 
    testFirstPageWithDirectives(null, null, successSchemaValidator)
  );

  it(
    "Should fetch first page of products matching a query "
    + "w/ default page size for page number directive only", 
    testFirstPageWithDirectives(0, null, successSchemaValidator)
  );

  it(
    "Should fetch first page of products matching a query "
    + "w/ full page directives", 
    testFirstPageWithDirectives(0, 20, successSchemaValidator)
  );

  it(
    "Should retrieve only 30 products, although requested more", 
    testFirstPageWithDirectives(0, 31, successSchemaValidator)
  );

  it("Should get a 404 when query products on page out of page bounds", function(done) {
    var tags = ["hello", "kitty"];
    var url = app.getBaseUrl(server)+"/products?q="+encodeURIComponent(tags.join(" "));
    request(url, function(error, response, body) {
      body = JSON.parse(body);
      var countHeader = getTotalCountHeader(response);
      var totalCount = parseInt(countHeader);
      url += "&offset="+(totalCount+1);
      request(url, function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 404, "Unexpected status code " + response.statusCode);
        assert(body == "", "Unexpected body: " + body + ". Expected empty body.");
        done();
      });
    });
  });
});