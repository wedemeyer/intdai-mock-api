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

describe('Tests', function() {

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
  /* /searches?query=<query>&type=product */
  /****************************************/

  var testFirstPageWithDirectives = function(page, pageSize, handler, done) {
    var tags = ["hello", "kitty"];
    var url = app.getBaseUrl(server)+"/searches?query="+tags.join(" ")+"&type=product";
    if (!!page) url += "&page=" + page;
    if (!!pageSize) url += "&size=" + pageSize;
    request(url, handler(done));
  }

  var successSchemaValidator = function(done) {
    return function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      body = JSON.parse(body);
      validation.checkSchemaRecursive(require('./schemas/searches/productsSearchResponse'), body, function(err) {
        if (!!err) return done(err, null);
        done(null, body);
      });    
    }    
  }

  var pageValidator = function(page, size, done) {
    return function(err, body) {
      if (!!err) return done(err);
      assert.equal(body.data.page.page, page, "Unexpected default page `"+body.data.page.page+"`. Expected `"+page+"`.");
      assert.equal(body.data.page.size, size, "Unexpected default page size `"+body.data.page.size+"`. Expected `"+size+"`.");
      done();
    }
  }

  it("Should fetch first page of products matching a query w/ default page size w/o page directives given", function(done) {
    testFirstPageWithDirectives(null, null, successSchemaValidator, pageValidator(1, 10, done));
  });

  it("Should fetch first page of products matching a query w/ default page size for page number directive only", function(done) {
    testFirstPageWithDirectives(1, null, successSchemaValidator, pageValidator(1, 10, done));
  });

  it("Should fetch first page of products matching a query w/ full page directives", function(done) {
    testFirstPageWithDirectives(1, 20, successSchemaValidator, pageValidator(1, 20, done));
  });

  it("Should get a 404 when fetch a page of products matching a query out of page bounds", function(done) {
    var tags = ["hello", "kitty"];
    var url = app.getBaseUrl(server)+"/searches?query="+tags.join(" ")+"&type=product";
    request(url, function(error, response, body) {
      body = JSON.parse(body);
      var maxPage = Math.ceil(body.data.page.count / body.data.page.size);
      request(url + "&page="+(maxPage+1), function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 404, "Unexpected status code " + response.statusCode);
        assert(body == "", "Unexpected body: " + body + ". Expected empty body.");
        done();
      });
    });
  });

  /****************************************/
  /* Categories endpoint                  */
  /* /searches?query=<query>&type=term    */
  /****************************************/

  it("Should fetch all terms matching a query", function(done) {
    var tags = ["hello", "kitty"];
    request(app.getBaseUrl(server)+"/searches?query="+tags.join(" ")+"&type=term", function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      validation.checkSchemaRecursive(require('./schemas/searches/termsSearchResponse'), JSON.parse(body), function(err) {
        if (!!err) return done(err);
        done();
      });
    });
  });

});