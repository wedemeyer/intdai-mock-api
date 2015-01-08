var async = require("async");

exports.route = function(app, router) {

  function searchProducts(req, resp) {
    var query = function(select) {
      return "SELECT " + select + " FROM `products` AS `p` "
        + "INNER JOIN `product_tags` AS `pt` "
        + "ON p.id = pt.product_id"
    }
    var q = app.db.get(query("count(*) AS `count`"), function(err, res) {
      if (!!err || !res) return resp.status(501).end();
      var count = res.count;
      var offset = (req.query["offset"]||0);
      var limit = (req.query["limit"]||30);
      // Limit limit to 30 and respond with client error status code if limitation convention was breached
      if (limit > 30) limit = 30;
      var q = query("`id`, `title`, `mainImgUrl`, `current_price`, `previous_price`, `cut`") + " ORDER BY RANDOM() LIMIT ? OFFSET ?";
      app.db.all(q, [limit, offset], function(err, res) {
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
          resp.setHeader("X-Total-Count", ""+count);
          resp.status(200).json(app.limitResponse(req, {data: products}));
        });
      });
    });
  };

  router.get(/^\/products$/, function(req, resp) {
    if (!req.query["q"]) {
      resp.setHeader("X-Total-Count", ""+0);
      resp.status(200).json({data: []});
      return;
    }
    searchProducts(req, resp);
  });
        
  
}
