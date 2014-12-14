exports.getSchema = function() {
	return {
		type: Object,
		id: {
			type: String,
			required: true,
			length: { 
				min: 36 
			}, 
			test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i 
		},
		label: {
			type: String,
			required: true,
			length: {
				min: 1
			}
		},
		imgUrl4x4: {
			type: String,
			required: true, 
			length: { 
				min: 8
			},
			test: /^http(s)?:\/\//gi
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
				test: /^[a-z]+$/gi
			}
		}
	};
};

