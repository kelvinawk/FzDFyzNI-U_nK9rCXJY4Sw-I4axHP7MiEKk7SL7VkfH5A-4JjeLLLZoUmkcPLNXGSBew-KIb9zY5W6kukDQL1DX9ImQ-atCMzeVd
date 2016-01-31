'use strict';

(function() {
	let Promise = require("bluebird");
	let mongoose = Promise.promisifyAll(require("mongoose"));
	let co = require("co");

	function MongoDBConnection(uri){
		this.uri = uri;
	}

	MongoDBConnection.prototype.openConnection = function (){
		let uri = this.uri;
		
		return co(function*() {
			if(mongoose.connection.readyState){
				console.log("connection is ready!");
				yield Promise.resolve(mongoose.connection.readyState);
			} else {
				console.log("connection is not ready, now connecting to mongodb...");
				mongoose.connect(uri);
				console.log(`connecting to mongo...state: ${mongoose.connection.readyState}`);
				yield mongoose.connection.onceAsync('open');
				console.log(`connecting to mongo...state: ${mongoose.connection.readyState}`);
			}
		});
	}

	MongoDBConnection.prototype.closeConnection = function(){
		return co(function*(){
			if(mongoose.connection.readyState){
				yield Promise.resolve(mongoose.connection.close());
			}
		});
	}
	module.exports = MongoDBConnection;
})();