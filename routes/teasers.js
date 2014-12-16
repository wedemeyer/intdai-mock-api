var async = require("async");

exports.route = function(app, router) {

  function respondTeaserById(id, req, resp) {
    app.db.get("SELECT * FROM `teasers` WHERE `id`=?", id, function(err, res) {
      if (err != null) return resp.status(501).end();
      if (!res) return resp.status(404).end();
      var teaser = {
        "id": res.id,
        "title": res.title,
        "class": res.class,
        "imgUrl16x6": res.img_url_16x6
      };
      var finalize = function(teaser) {
        var teaserResponse = {"data": teaser};
        resp.status(200).json(app.limitResponse(req, teaserResponse));
      }
      if (undefined != res["item_query_id"]) {
        var query = "SELECT `tags` FROM `item_queries` WHERE `id`=?";
        app.db.get(query, res.item_query_id, function(err, res) {
          if (err != null) return resp.status(501).end();
          teaser["itemsQuery"] = {"tags": JSON.parse(res.tags)};
          finalize(teaser);
        });
      } else {
        teaser["sections"] = [];
        var query = "SELECT `tags`, `flow_type`, ts.`title` FROM `rel__teasers__teaser_sections` AS rel "
        + "LEFT JOIN `teaser_sections` AS ts ON rel.teaser_section_id = ts.id "
        + "LEFT JOIN `item_queries` AS iq ON iq.id = ts.item_query_id "
        + "WHERE `teaser_id`=?";
        app.db.all(query, id, function(err, res) {
          if (err != null) return resp.status(501).end();
          for (var i=0; i<res.length; i++) {
            var section = res[i];
            teaser.sections.push({ 
              "title": section.title, 
              "flowType": section.flow_type, 
              "itemsQuery": {"tags": JSON.parse(section.tags)} 
            });
          }
          finalize(teaser);
        });  
      }
    });
  }

  function respondTeaserPageForTag(tag, req, resp) {
    var handler = function(err, res) {
      if (err != null) return resp.status(501).end();
      if (res.length == 0) return resp.status(200).json({"data":[]});
      async.map(resp, function(data, cb) {
        var teaser = {
          "id": data.id,
          "title": data.title
        };
        for (var aspect in ["16x6", "4x6", "3x6", "4x4"]) {
          if (!!data["img_url_"+aspect]) {
            teaser["imgUrl16x6"+aspect] = data["img_url_"+aspect];
          }
        }
        if (!!data["item_query_id"]) {
          var query = "SELECT `tags` FROM `item_queries` WHERE `id`=?";
          app.db.get(query, data.item_query_id, function(err, res) {
            if (err != null) return resp.status(501).end();
            teaser["itemsQuery"] = {"tags": JSON.parse(res.tags)};
            cb(null, teaser);
          });
        } else {
          teaser["sections"] = [];
          var query = "SELECT `tags`, `flow_type`, ts.`title` FROM `rel__teasers__teaser_sections` AS rel "
          + "LEFT JOIN `teaser_sections` AS ts ON rel.teaser_section_id = ts.id "
          + "LEFT JOIN `item_queries` AS iq ON iq.id = ts.item_query_id "
          + "WHERE `teaser_id`=?";
          app.db.all(query, data.id, function(err, res) {
            if (err != null) return resp.status(501).end();
            for (var i=0; i<res.length; i++) {
              var section = res[i];
              teaser.sections.push({ 
                "title": section.title, 
                "flowType": section.flow_type, 
                "itemsQuery": {"tags": JSON.parse(section.tags)} 
              });
            }
            cb(null, teaser);
          });  
        }
      }, function(err, teasers) {
        if (!!err) return res.status(501).end();
        var teaserResponse = {"data": teasers};
        resp.status(200).json(app.limitResponse(req, teaserResponse));
      });
    };
    if (!!tag) {
      var query = "SELECT * FROM `teasers` AS `t` "
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
