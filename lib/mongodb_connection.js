'use strict';

(function() {
	//import declaration
	let Promise = require("bluebird");
	let mongoose = Promise.promisifyAll(require("mongoose"));
	let co = require("co");

	/*
	 * MongoDBConnection constructor
	 * 
	 * @param {mongodb_config} config - configuration of mongodb, see mongodb_config.js
	 * @constructor
	 */
	function MongoDBConnection(config){
		this.config = config;
	}

	/*
	 * Function: open MongoDB connection
	 */
	MongoDBConnection.prototype.openConnection = function (){
		let mongodb_uri = this.config.uri;
		
		return co(function*() {
			if(mongoose.connection.readyState){
				console.log(`[${MongoDBConnection.name}] connection is ready!`);
				yield Promise.resolve(mongoose.connection.readyState);
			} else {
				console.log(`[${MongoDBConnection.name}]connection is not ready, now connecting to mongodb...`);
				mongoose.connect(mongodb_uri);
				console.log(`[${MongoDBConnection.name}] mongodb is connected.`);
			}
		}).catch(function(err){
			console.log(err);
		});
	}

	/*
	 * Function: close MongoDB connection
	 */
	MongoDBConnection.prototype.closeConnection = function(){
		return co(function*(){
			if(mongoose.connection.readyState){
				yield Promise.resolve(mongoose.connection.close());
				console.log(`[${MongoDBConnection.name}] mongodb connection closed`);
			}
		});
	}
	module.exports = MongoDBConnection;
})();