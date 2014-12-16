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

  /******************************/
  /* Teaser endpoint           */
  /* /teaser/<id>              */
  /******************************/

  function testLoadTeaserById(cb) {
    db.all("SELECT `id` FROM `teasers` ORDER BY RANDOM() LIMIT 1", function(err, res) {
      assert(!err, "Unexpected error on getting teaser stubs' IDs.");
      async.each(res, function(teaser, cb) {
        request(app.getBaseUrl(server)+"/teasers/"+teaser.id+"?_exclude=data.title", function(error, response, body) {
          assert(!error, "Unexpected error "+error);
          assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
          validation.checkSchemaRecursive(require('./schemas/teasers/teaserResponse'), JSON.parse(body), cb);
        });
      }, function(err) {
        cb(err);
      });   
    });
  }

  it("Should fetch a teaser by ID", testLoadTeaserById);

  /******************************/
  /* Teaser lists endpoints     */
  /* /teasers                   */
  /******************************/

  function testLoadTeaserPageByTag(tag, cb) {
    request(app.getBaseUrl(server)+"/teasers" + (!!tag ? "?tag="+tag : ""), function(error, response, body) {
      assert(!error, "Unexpected error "+error);
      assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
      // Verify teasers page response schema
      validation.checkSchemaRecursive(require('./schemas/teasers/teasersResponse'), JSON.parse(body), cb);
    });
  }

  it("Should fetch the first page of teasers by tag", function(done) {
    testLoadTeaserPageByTag("mobile_home_banners", done);
  });

  it("Should fetch the first page of teasers without tag", function(done) {
    testLoadTeaserPageByTag(null, done);
  });


});
