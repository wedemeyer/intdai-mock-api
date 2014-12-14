exports.getSchema = function() {
	return {
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
		flowType: {
			type: String,
			required: true,
			length: {
				min: 1
			},
			test: /^(PRODUCT_DETAIL|PINTEREST)+$/gi
		}
	}
}