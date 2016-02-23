'use strict';

(function () {
	let mongoose = require('mongoose');
	let Schema = mongoose.Schema;

	/**
	 * ExchangeRate mongo schema
	 * @param {string} from - currency from which country
	 * @param {string} to - currency to which country
	 * @param {Number} rate - exchange rate
	 * @param {Date} created_at - datetime of record creation
	 */

	let ExchangeRate = new Schema({
		from: String,
		to: String,
		rate: String,
		created_at: {type: Date, default: Date.now}
	}, {collection: 'exchange_rate'});

	module.exports = mongoose.model('exchange_rate', ExchangeRate);
}());
