var _ = require("underscore");
var request = require("request");
var assert = require("assert");
var async = require("async");
var app = null;
var config = require('../config');
var sqlite3 = require('sqlite3');
var validation = require('../lib/validation');
var toCamelCase = require("to-camel-case");
var db = null;

describe('Tests', function() {

  before(function(done) {
    app = require('./../app').create().listen(process.env.PORT || 4730);
    db = new sqlite3.Database(config.test.db.file, sqlite3.OPEN_READONLY);;
    done();
  });

  after(function(done){
    app.close();
    done();
  });

  /******************************/
  /* Teaser endpoint           */
  /* /teaser/<id>              */
  /******************************/

  function testLoadTeaserById(cls, cb) {
    // Test for all teasers in the database that qualify the class
    db.all("SELECT `id` FROM `teasers` WHERE `class`=?", cls, function(err, res) {
      assert(!err, "Unexpected error on getting teaser stubs' IDs.");
      async.each(res, function(teaser, cb) {
        request("http://localhost:4730/teasers/"+teaser.id+"?_exclude=data.title,data.class", function(error, response, body) {
          assert(!error, "Unexpected error "+error);
          assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
          validation.checkSchemaRecursive(require('./schemas/teasers/_anyTeaserResponse').for(cls), JSON.parse(body), cb);
        });
      }, function(err) {
        cb(err);
      });   
    });
  }

  it("Should fetch a banner teaser by ID", function(done) {
    testLoadTeaserById("banner", function(err) {
      done(err);
    });
  });

  it("Should fetch a tile teaser by ID", function(done) {
    testLoadTeaserById("banner", function(err) {
      done(err);
    });
  });

  it("Should fetch a editors teaser by ID", function(done) {
    testLoadTeaserById("banner", function(err) {
      done(err);
    });
  });

  /******************************/
  /* Teaser lists endpoints     */
  /* /teasers/<class>           */
  /******************************/

  function testLoadTeaserPageByClass(cls, cb) {
    request("http://localhost:4730/teasers/"+cls, function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      // Verify teasers page response schema
      validation.checkSchemaRecursive(require('./schemas/teasers/'+toCamelCase(cls)+'TeasersResponse'), JSON.parse(body), cb);
    });
  }

  it("Should fetch the first page of banner teasers", function(done) {
    testLoadTeaserPageByClass("banner", function() {
      done()
    });
  });

  it("Should fetch the first page of tile teasers", function(done) {
    testLoadTeaserPageByClass("tile", function() {
      done()
    });
  });

  it("Should fetch the first page of editors teasers", function(done) {
    testLoadTeaserPageByClass("editors_choice", function() {
      done()
    });
  });

});
