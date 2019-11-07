//app/models/role.js
//load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
//define the schema for our role model
var roleSchema = mongoose.Schema({	
	_id:{ type: ObjectId },
	name: String,
});

module.exports = mongoose.model('ex_role', roleSchema);