var schema = {
	type: Object,
	required: true,
	id: {
		type: String,
		required: true,
		length: { 
			min: 36 
		}, 
		test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i 
	},
	title: {
		type: String,
		required: true,
		length: {
			min: 1
		}
	},
	description: {
		type: String
		required: false
	},
	simples: {
		type: Array,
		required: true
	}
};

exports.getSchema = function() {
	return schema;
}

exports.runCustomSchemas = function(obj, run) {
	for (var i=0; i<obj.simples.length, i++) {
		run(obj.simples[i], {
			errorMsg: "Unexpected product simple schema",
			schema: require('./productSimple')
		});
	}
}
