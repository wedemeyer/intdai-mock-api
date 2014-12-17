var async = require("async");

exports.route = function(app, router) {

  function searchProducts(req, resp) {
    var tags = req.query.query.split(" ");
    
    var query = function(tags, select) {
      return "SELECT " + select + " FROM `products` AS `p` "
        + "INNER JOIN `product_tags` AS `pt` "
        + "ON p.id = pt.product_id "
        + "WHERE pt.tag IN ("+tags.map(function(){return "?"}).join()+")";
    }
    app.db.get(query(tags, "count(*) AS `count`"), tags, function(err, res) {
      if (!!err || !res) return resp.status(501).end();
      var count = res.count;
      var page = (req.query["page"]||1);
      var size = (req.query["size"]||10);
      var innerQuery = "SELECT `id`, `current_price`, `previous_price`, `cut` "
      + "FROM `product_simples` "
      + "WHERE `product_id` = ? ORDER BY RANDOM() LIMIT 1";
      var q = query(tags, "`id`, `title`, `mainImgUrl`") + " ORDER BY `id` LIMIT ? OFFSET ?";
      app.db.all(q, tags.concat([page, (page-1)*size]), function(err, res) {
        if (!!err) return resp.status(501).end();
        if (res.length == 0) return resp.status(404).end();
        var productIds = [];
        res.forEach(function(data) { productIds.push(data.id) });
        async.map(res, function(data, cb) {
          app.db.get(innerQuery, data.id, function(err, res) {
            var obj = {
              id: data.id,
              title: data.title,
              simpleId: res.id,
              price: {
                current: res.current_price,
              }
            };
            if (!!res.previous_price) obj.price.previous = res.previous_price;
            if (!!res.cut) obj.price.cut = res.cut;
            cb(null, obj);
          });
        }, function(err, products) {
          if (!!err) return resp.status(501).end();
          var productsResponse = { 
            "data": {
              "page": {
                "page": page,
                "count": count,
                "size": size
              },
              "items": products 
            }
          };
          resp.status(200).json(app.limitResponse(req, productsResponse));
        });
      });
    });
  };

  function searchTerms(req, resp) {
    var tags = req.query.query.split(" ");
    var query = "SELECT `tag` FROM `product_tags`";
    app.db.all(query, function(err, res) {
      if (!!err) return resp.status(501).end();
      if (!res) return resp.status(404).end();
      var terms = [];
      res.forEach(function(data) { terms.push(data.tag); });
      Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
      };
      terms = terms.diff(tags);
      var termsResponse = {
        "data": terms
      };
      resp.status(200).json(app.limitResponse(req, termsResponse));
    });
  };

  router.get(/^\/searches$/, function(req, resp) {
    switch (req.query.type) {
      case "product":
        searchProducts(req, resp);
        break;
      case "term":
        searchTerms(req, resp);
        break;
      default:
        resp.status(404).end();
        break;
    }
  });
        
  
}
