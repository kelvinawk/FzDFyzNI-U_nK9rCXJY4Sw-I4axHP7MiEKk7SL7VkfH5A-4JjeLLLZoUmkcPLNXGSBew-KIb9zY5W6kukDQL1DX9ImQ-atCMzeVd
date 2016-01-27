'use strict';

(function(){

	var jsdom = require("jsdom");
	var request = require("request");
	var Promise = require("bluebird");
	var api_url = "http://www.xe.com/currencyconverter/convert";

	function ExchangeRateHandler() {}

	ExchangeRateHandler.prototype.getExchangeRate = function (from, to, callback) {
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