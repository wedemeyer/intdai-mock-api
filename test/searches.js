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
    app = require('./../app').create().listen(process.env.PORT || 4732);
    db = new sqlite3.Database(config.test.db.file, sqlite3.OPEN_READONLY);;
    done();
  });

  after(function(done){
    app.close();
    done();
  });

  /****************************************/
  /* Categories endpoint                  */
  /* /searches?query=<query>&type=product */
  /****************************************/

  it("Should fetch all products matching a query", function(done) {
    var tags = ["hello", "kitty"];
    var query = "SELECT `id`, `title` "
    + "FROM `products` AS `p` "
    + "INNER JOIN `product_tags` AS `pt` "
    + "ON p.id = pt.product_id "
    + "WHERE pt.tag IN ("+tags.map(function(){return "?"}).join()+")";
    db.all(query, tags, function(err, products) {
      assert(!err, "Unexpected error when fetching products by query ("+err+")");
      assert(products.length > 0, "Unexpected missing results when fetching products by query");
      request("http://localhost:4732/searches?query="+tags.join(" ")+"&type=product", function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
        validation.checkSchemaRecursive(require('./schemas/searches/productsSearchResponse'), JSON.parse(body), function(err) {
          if (!!err) return done(err);
          done();
        });        
      });
    });
  });

  /****************************************/
  /* Categories endpoint                  */
  /* /searches?query=<query>&type=term    */
  /****************************************/

  it("Should fetch all terms matching a query", function(done) {
    var tags = ["hello", "kitty"];
    var query = "SELECT `tag` FROM `product_tags`";
    db.all(query, function(err, res) {
      assert(!err, "Unexpected error when fetching products by query ("+err+")");
      assert(res.length > 0, "Unexpected missing tags when fetching tags for terms search by query");
      request("http://localhost:4732/searches?query="+tags.join(" ")+"&type=term", function(error, response, body) {
        assert(!error, "Unexpected error "+error);
        assert(response.statusCode == 200, "Unexpected status code " + response.statusCode);
        validation.checkSchemaRecursive(require('./schemas/searches/termsSearchResponse'), JSON.parse(body), function(err) {
          if (!!err) return done(err);
          done();
        });        
      });
    });
  });

});