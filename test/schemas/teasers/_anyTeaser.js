async = require("async");

exports.runCustomSchemas = function(run, obj, done) {
	if (!!obj["sections"] && !!obj["itemsQuery"]) 
		return done("Cannot have both sections or an item query"); 
	if (!obj["sections"] && !obj["itemsQuery"]) 
		return done("Missing sections or an item query"); 
	if (!!obj["sections"]) {
		var ok = run(
			{
				errorMsg: "Unexpected sections schema",
				getSchema: function() {
					return {
						sections: { 
							type: Array, 
							required: true, 
							length: { 
								min: 1 
							} 
						}
					}
				}
			},
			obj, 
			function(err) {
				if (!!err) return done(err);
				// Run all sections to verify their schema
				async.each(obj.sections, function(section, cb) {
					run(
						{
							errorMsg: "Unexpected sections schema",
							getSchema: function() {
								return {
									flowType: {
										type: String,
										required: true,
										test: /^(PRODUCT_DETAIL|PINTEREST)$/
									},
									itemsQuery: {
										type: Object,
										required: true,
										tags: { 
											type: Array, 
											required: true, 
											length: { 
												min: 1 
											},
											test: /^[a-z]$/gi
										}
									}
								}
							}
						},
						section,
						cb
					);
				}, done);
			}
		);
	} 
	if (!!obj["itemsQuery"]) {
		run(
			{
				errorMsg: "Unexpected item query schema",
				getSchema: function() {
					return {
						itemsQuery: { 
							type: Object, 
							required: true, 
							tags: {
								type: Object,
								required: true,
								length: { 
									min: 1 
								}
							} 
						}
					}
				}
			},
			obj, 
			done
		);
	}
};