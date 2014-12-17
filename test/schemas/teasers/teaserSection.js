exports.errorMsg = "Unexpected sections schema";

exports.getSchema = function() {
	return {
		title: {
			type: String,
			required: true
		},
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