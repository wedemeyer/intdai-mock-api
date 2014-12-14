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
	simpleId: {
		type: String,
		required: true,
		length: { 
			min: 36 
		}, 
		test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i 
	},
	imgUrl: {
		type: String, 
		required: true, 
		length: { 
			min: 8 
		}
	},
	price: {
		type: Object,
		required: true,
		current: {
			type: String,
			required: true,
			test: /[a-z]{3}\ [0-9]+(.[0-9]+)(,[0-9]{2})?/gi
		},
		sale: {
			type: Object,
			require: false,
			previous: {
				type: String,
				required: true,
				test: /[a-z]{3}\ [0-9]+(.[0-9]+)(,[0-9]{2})?/gi
			},
			cut: {
				type: String,
				required: true
			}
		}
	}
};

exports.getSchema = function() {
	return schema;
}