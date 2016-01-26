'use strict';

(function(){

	var jsdom = require("jsdom");
	var request = require("request");
	var api_url = "http://www.xe.com/currencyconverter/convert";

	function ExchangeRateHandler() {}

	ExchangeRateHandler.prototype.getExchangeRate = function (from, to, callback) {
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
						let exchange_rate_text = $(".uccResUnit > .rightCol").text();
						let exchange_rate = exchange_rate_text.match(`1\\s${to}\\s=\\s(.*)\\s${from}`);
						if (exchange_rate !== null) {
							exchange_rate = Number(exchange_rate[1]).toFixed(2).toString();
						} else {
							console.log("Cannot get exchange rate.");
						}
					}
				);
			}
		); 
	}

	module.exports = ExchangeRateHandler;
})();