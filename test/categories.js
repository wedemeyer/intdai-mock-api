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
  /* Top categories endpoint    */
  /* /categories/top            */
  /******************************/

  it("Should fetch all first level categories", function(done) {
    var query = "SELECT c.id, label, img_url_4x4 as `imgUrl4x4`, tags "
    + "FROM `categories` AS c "
    + "LEFT JOIN `item_queries` AS iq "
    + "ON c.item_query_id = iq.id "
    + "WHERE parent_id IS NULL";
    db.all(query, function(err, cats) {
      assert(!err, "Unexpected error when fetching all categories ("+err+")");
      assert(cats.length > 0, "Unexpected missing results when fetching all categories");
      cats.map(function(item) {
        item.itemsQuery = { tags: JSON.parse(item.tags) };
        delete item.tags;
      });
      request(app.getBaseUrl(server)+"/categories/top", function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
        body = JSON.parse(body);
        validation.checkSchemaRecursive(require('./schemas/categories/categoriesResponse'), body, function(err) {
          assert(!err, "Unexpected error when validating categories response schema (" + err + ")");
          assert(body.data.length == cats.length);
          done();
        });        
      });
    });
  });

  /******************************/
  /* Category endpoint          */
  /* /categories/<id>           */
  /******************************/

  it("Should fetch a category by ID", function(done) {
    var query = "SELECT c.id, label, img_url_4x4 as `imgUrl4x4`, tags "
    + "FROM `categories` AS c "
    + "LEFT JOIN `item_queries` AS iq "
    + "ON c.item_query_id = iq.id "
    + "ORDER BY RANDOM() LIMIT 1";
    db.get(query, function(err, res) {
      assert(!err, "Unexpected error when fetching all categories ("+err+")");
      assert(!!res, "Unexpected missing category when fetching by random");
      request(app.getBaseUrl(server)+"/categories/"+res.id, function(error, response, body) {
        assert(!error, "Unexpected error: "+error);
        assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
        body = JSON.parse(body);
        validation.checkSchemaRecursive(require('./schemas/categories/categoryResponse'), body, function(err) {
          assert(!err, "Unexpected error when validating category schema (" + err + ")");
          done();
        });
      });
    });
  });

  /**********************************/
  /* Subcategories endpoint         */
  /* /categories/<id>/subcategories */
  /**********************************/

  it("Should fetch subcategories", function(done) {
    var query = "SELECT id FROM categories WHERE parent_id IS NULL ORDER BY RANDOM() LIMIT 1";
    db.get(query, function(err, res) {
      assert(!err, "Unexpected error when fetching a random top category's ID ("+err+")");
      assert(!!res, "Unexpected missing top category");
      var topCatId = res.id;
      db.get("SELECT count(*) as `count` FROM categories WHERE parent_id = ?", topCatId, function (err, res) {
        assert(!err, "Unexpected error when fetching all subcategories for top category with ID "+topCatId+" ("+err+")");
        assert(!!res, "Unexpected missing subcategories");
        request(app.getBaseUrl(server)+"/categories/"+topCatId+"/subcategories", function(error, response, body) {
          assert(!error, "Unexpected error "+error);
          assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
          body = JSON.parse(body);
          validation.checkSchemaRecursive(require('./schemas/categories/subcategoriesResponse'), body, function(err) {
            assert(!err, "Unexpected error when validating subcategories schema (" + err + ")");
            assert(body.data.length == res.count);
            done();
          });
        });
      });
    });
  });


});
