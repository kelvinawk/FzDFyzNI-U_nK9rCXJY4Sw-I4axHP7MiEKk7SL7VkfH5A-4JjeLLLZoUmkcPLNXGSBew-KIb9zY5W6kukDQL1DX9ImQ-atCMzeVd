'use strict';

(function(){
	var Promise = require("bluebird");
	var co = require("co");
	var jsdom = require("jsdom");
	var request = require("request");
	var ExchangeRate = require("./exchange_rate");
	var mongodb_config = require("./config/mongodb_config");
	var MongodbConnection = require("./mongodb_connection");
	var Seed = require("./seed");

	var api_url = "http://www.xe.com/currencyconverter/convert";

	function ExchangeRateHandler() {
		this.type = 'exchange_rate';
	}

	ExchangeRateHandler.prototype.work = function (payload, callback) {
		let mongodb_connection = new MongodbConnection(mongodb_config);
		let seed = new Seed(payload.from, payload.to, payload.success_count, payload.failure, payload.priority);
		
		co(function*(){
			yield mongodb_connection.openConnection();
			let exchange_rate = yield getExchangeRate(payload.from, payload.to);
			console.log(`excuting callback..., exchange_rate: ${exchange_rate}`);
			let data = yield new ExchangeRate({
				from: payload.from, 
				to: payload.to, 
				rate: exchange_rate}).save();
			console.log(`data saved. ${data}`);
			
			yield mongodb_connection.closeConnection();
			console.log("mongodb connection closed");
			callback('success');
		}).catch(function(err) {
			console.log(err);
		});
	}

	/*
	 *
	 *
	 *
	 */
	function getExchangeRate(from, to){
		return new Promise(function(resolve, reject){
			request({
			url: api_url,
			qs: {
				Amount: 1,
				From: from,
				To: to
			}, 
			method: "GET"
			}, function (error, response, body){
					jsdom.env(
						body,["http://code.jquery.com/jquery.js"],function(err, window){
							var $ = window.$;
							let exchange_rate_text = $(".uccResUnit > .leftCol").text();
							let exchange_rate = exchange_rate_text.match(`1\\s${from}\\s=\\s(.*)\\s${to}`);
							if (exchange_rate !== null) {
								exchange_rate = Number(exchange_rate[1]).toFixed(2).toString();
								resolve(exchange_rate);
							} else {
								reject("Cannot get exchange rate.");
							}
						}
					);
				}
			);
		});
	}

	module.exports = ExchangeRateHandler;
})();