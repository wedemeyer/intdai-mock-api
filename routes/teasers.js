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

  function respondTeaserPageForClass(cls, req, resp) {
    app.db.all("SELECT * FROM `teasers` WHERE `class`=?", cls, function(err, res) {
      if (err != null) return resp.status(501).end();
      if (res.length == 0) return resp.status(200).json({"data":[]});
      async.map(resp, function(data, cb) {
        var teaser = {
          "id": data.id,
          "title": data.title,
          "class": data.class,
          "imgUrl16x6": data.img_url_16x6
        };
        if (undefined != data["item_query_id"]) {
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
    });
  }

  router.get(/^\/teasers\/([^\/]+)$/, function(req, res) {
    var variable = req.params[0];
    switch (variable) {
      case "banner":
      case "tile": 
      case "editors_choice":
        respondTeaserPageForClass(variable, req, res);
        break;
      default:
        respondTeaserById(variable, req, res);
        break;
    }
  });
  
}
