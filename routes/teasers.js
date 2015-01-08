var async = require("async");

exports.route = function(app, router) {

  function createTeaserFromData(isLoadSections) {
    return function (data, cb) {
      var teaser = {
        "id": data.id,
        "title": data.title
      };
      var finish = function(data, teaser) {
        teaser["sections"] = [];
        var query = "SELECT `tags`, `flow_type`, ts.`title` FROM `rel__teasers__teaser_sections` AS rel "
        + "LEFT JOIN `teaser_sections` AS ts ON rel.teaser_section_id = ts.id "
        + "LEFT JOIN `item_queries` AS iq ON iq.id = ts.item_query_id "
        + "WHERE `teaser_id`=?";
        app.db.all(query, teaser.id, function(err, res) {
          if (err != null) return cb(err);
          for (var i=0; i<res.length; i++) {
            var sortOptions = null;
            do {
                sortOptions = [ "relevance", "popularity", "price", "discount", "time" ].filter(function() { return Math.round(Math.random()*1000) % 2 });
            } while (sortOptions.length == 0);
            var section = res[i];
            teaser.sections.push({ 
              "sortOptions": sortOptions,
              "title": section.title, 
              "flowType": section.flow_type, 
              "itemsQuery": {"tags": JSON.parse(section.tags)} 
            });
          }
          cb(null, teaser);
        });
      }
      var query = "SELECT `key`, `url` FROM `image_urls` WHERE `ref_id` = ?";
      app.db.all(query, teaser.id, function(err, res) {
        if (err != null) return cb(err);
        if (res.length > 0) {
          teaser.imgUrls = {};
          res.forEach(function(data) { teaser.imgUrls[data.key] = data.url; });
        }
        if (isLoadSections) return finish(data, teaser);
        cb(null, teaser)
      });
    }
  }

  function respondTeaserById(id, req, resp) {
    app.db.get("SELECT * FROM `teasers` WHERE `id`=?", id, function(err, res) {
      if (!!err) return resp.status(501).end();
      if (!res) return resp.status(404).end();
      createTeaserFromData(true)(res, function(err, teaser) {
        if (err) return resp.status(501).end();
        resp.status(200).json(app.limitResponse(req, { data: teaser }));
      });
    });
  }

  function respondTeaserPageForTag(tag, req, resp) {
    var handler = function(err, res) {
      if (err != null) return resp.status(501).end();
      if (res.length == 0) return resp.status(200).json({"data":[]});
      async.map(res, createTeaserFromData(false), function(err, teasers) {
        if (!!err) return res.status(501).end();
        var teaserResponse = {"data": teasers};
        resp.status(200).json(app.limitResponse(req, teaserResponse));
      });
    };
    if (!!tag) {
      var query = "SELECT *, t.`id` AS `id` FROM `teasers` AS `t` "
      + "INNER JOIN `rel__teasers__teaser_tags` AS `rtt` "
      + "ON t.id = rtt.teaser_id "
      + "INNER JOIN `teaser_tags` AS `tt` "
      + "ON rtt.teaser_tag_id = tt.id "
      + "WHERE tt.tag = ?";
      app.db.all(query, tag, handler);
    } else {
      var query = "SELECT * FROM `teasers`";
      app.db.all(query, handler);
    }
  }

  router.get(/^\/teasers$/, function(req, res) {
    respondTeaserPageForTag(req.query["tag"], req, res);
  });

  router.get(/^\/teasers\/([^\/]+)$/, function(req, res) {
    respondTeaserById(req.params[0], req, res);
  });
  
}
