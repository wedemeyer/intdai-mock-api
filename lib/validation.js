var Validator = require('schema-validator');

function checkSchemaRecursive(conf, toCheck, done) {
	var check = new Validator(conf.getSchema()).check(toCheck);
	var traceObj = function(msg) { return msg + " (" + JSON.stringify(toCheck) + ")"; };
	if (!!check['_error']) return done(traceObj((conf.errorMsg||"Unexpected schema") + " (" + JSON.stringify(check) + ")")); 
	if (!conf["runCustomSchemas"]) return done();
	conf.runCustomSchemas(checkSchemaRecursive, toCheck, done);
};

exports.checkSchemaRecursive = checkSchemaRecursive;