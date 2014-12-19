var async = require("async");

exports.route = function(app, router) {

  function createRecommendationFromData(data, cb) {
      var recommendation = {
        "id": data.id,
        "title": data.title
      };
      var query = "SELECT `key`, `url` FROM `image_urls` WHERE `ref_id` = ?";
      app.db.all(query, recommendation.id, function(err, res) {
        if (err != null) return cb(err);
        if (res.length > 0) {
          recommendation.imgUrls = {};
          res.forEach(function(data) { recommendation.imgUrls[data.key] = data.url; });
        }
        cb(null, recommendation)
      });
  }

  function respondRecommendations(req, resp) {
      var query = "SELECT * FROM `recommendations`";
      app.db.all(query, function(err, res) {
        if (err != null) return resp.status(501).end();
        if (res.length == 0) return resp.status(200).json({"data":[]});
        async.map(res, createRecommendationFromData, function(err, recommendations) {
          if (!!err) return res.status(501).end();
          var recommendationResponse = {"data": recommendations};
          resp.status(200).json(app.limitResponse(req, recommendationResponse));
        });
      });
  }

  function respondRecommendationProducts(id, req, resp) {
    var query = "SELECT count(*) AS `count` "
    + "FROM `rel__recommendations__products` "
    + "WHERE `recommendation_id` = ?"
    app.db.get(query, id, function(err, res) {
      if (!!err || !res) return resp.status(501).end();
      var count = res.count;
      var page = (req.query["page"]||1);
      var size = (req.query["size"]||10);
      // Limit page size and respond with client error status code if limitation convention was breached
      if (size > 30) return resp.status(400).end();
      query = "SELECT * FROM `rel__recommendations__products` as rrp "
      + "INNER JOIN `products` AS p ON rrp.product_id = p.id "
      + "WHERE `recommendation_id` = ? "
      + "ORDER BY `product_id` LIMIT ? OFFSET ?";
      app.db.all(query, [id, page, (page-1)*size], function(err, res) {
        if (!!err) return resp.status(501).end();
        if (res.length == 0) return resp.status(404).end();
        var productIds = [];
        res.forEach(function(data) { productIds.push(data.id) });
        async.map(res, function(data, cb) {
          var obj = {
            id: data.id,
            title: data.title,
            price: {
              current: data.current_price
            }
          };
          if (!!data.previous_price) obj.price.previous = data.previous_price;
          if (!!data.cut) obj.price.cut = data.cut;
          cb(null, obj);
        }, function(err, products) {
          if (!!err) return resp.status(501).end();
          var productsResponse = { 
            "data": {
              "page": {
                "page": parseInt(page),
                "count": count,
                "size": parseInt(size)
              },
              "items": products 
            }
          };
          resp.status(200).json(app.limitResponse(req, productsResponse));
        });
      });
    });
  }

  router.get(/^\/recommendations$/, function(req, res) {
    respondRecommendations(req, res);
  });

  router.get(/^\/recommendations\/([^\/]+)\/products$/, function(req, res) {
    respondRecommendationProducts(req.params[0], req, res);
  });
  
}
