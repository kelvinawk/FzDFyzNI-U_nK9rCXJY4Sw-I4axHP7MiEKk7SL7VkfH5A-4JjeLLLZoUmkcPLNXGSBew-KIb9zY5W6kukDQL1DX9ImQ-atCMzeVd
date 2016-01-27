'use strict';

(function(){
	let mongoose = require('mongoose');
	let Schema = mongoose.Schema;
	
	/**
	 * 
	 * 
	 */

	 let ExchangeRate = new Schema({
	 	from: String,
	 	to: String,
	 	rate: String,
	 	created_at: {type: Date, default: Date.now}
	 }, {collection: 'exchange_rate'});

	module.exports = mongoose.model('exchange_rate',ExchangeRate);
})();