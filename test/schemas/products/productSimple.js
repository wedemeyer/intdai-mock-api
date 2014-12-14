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
	attributes: {
		type: Array,
		required: true
	},
	price: {
		type: Object,
		required: true,
		current: {
			type: Number,
			required: true
		},
		former: {
			type: Object,
			required: false,
			value: {
				type: Number,
				required: true
			},
			cut: {
				type: String,
				required: true
			},
			length: {
				min: 1
			}
		}
	}
};

exports.getSchema = function() {
	return schema;
}

exports.runCustomSchemas = function(obj, run) {
	for (var i=0; i<obj.attributes.length, i++) {
		run(obj.attributes[i], {
			errorMsg: "Unexpected product simple attribute schema",
			schema: require('./productSimpleAttribute')
		});
	}
}
