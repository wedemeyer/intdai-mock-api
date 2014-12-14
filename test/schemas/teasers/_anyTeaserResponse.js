exports.for = function(cls) {
	return {
		getSchema: function() {
			return {
				data: {
					type: Object,
					required: true
				}
			};
		},
		runCustomSchemas: function(run, obj, done) {
			run(require('./'+cls+'Teaser'), obj.data, done);
		}
	};
};

